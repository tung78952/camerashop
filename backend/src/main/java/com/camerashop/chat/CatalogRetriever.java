package com.camerashop.chat;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.camerashop.entity.Product;
import com.camerashop.entity.ProductSpec;
import com.camerashop.entity.ProductVariant;
import com.camerashop.repository.ProductRepository;
import com.camerashop.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CatalogRetriever {

    static final int TOP_K = 8;

    static final String CAMERA = "Máy ảnh";
    static final String LENS = "Ống kính";
    static final String BATTERY = "Pin & sạc";
    static final String CARD = "Thẻ nhớ";

    private static final BigDecimal MILLION = BigDecimal.valueOf(1_000_000);

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;

    public record Need(String category, String brand, BigDecimal minBudget, BigDecimal maxBudget, String forCamera) {
    }

    public record VariantInfo(String name, BigDecimal price, boolean inStock) {
    }

    public record CatalogItem(Long id, String name, String brand, String category, String mount, String imageUrl,
                              String description, BigDecimal minPrice, List<VariantInfo> variants, List<String> highlights) {
    }

    public record Retrieval(Need need, List<CatalogItem> items, boolean relaxedBudget) {
    }

    @Transactional(readOnly = true)
    public Retrieval retrieve(String question, String previousQuestion) {
        String now = normalize(question);
        String context = normalize((previousQuestion == null ? "" : previousQuestion) + " " + question);

        List<Product> products = productRepository.findByActiveTrue();
        Map<Long, List<ProductVariant>> variants = productVariantRepository.findAll().stream()
                .collect(Collectors.groupingBy(variant -> variant.getProduct().getId()));

        String category = detectCategory(now);
        if (category == null) {
            category = detectCategory(context);
        }
        String brand = detectBrand(now) != null ? detectBrand(now) : detectBrand(context);
        BigDecimal[] budget = detectBudget(now);
        if (budget == null) {
            budget = detectBudget(context);
        }
        Product camera = findMentionedCamera(context, products);
        Need need = new Need(category, brand, budget == null ? null : budget[0], budget == null ? null : budget[1],
                camera == null ? null : camera.getName());

        List<Product> matched = new ArrayList<>();
        for (Product product : products) {
            if (fits(product, need, camera)) {
                matched.add(product);
            }
        }

        Set<String> keywords = keywords(now + " " + context);
        Map<Long, Integer> scores = new HashMap<>();
        for (Product product : matched) {
            scores.put(product.getId(), score(product, keywords, camera));
        }
        List<Product> inBudget = matched.stream()
                .filter(product -> withinBudget(minPrice(variants.get(product.getId())), need))
                .toList();
        boolean relaxed = need.maxBudget() != null && inBudget.isEmpty() && !matched.isEmpty();

        List<Product> chosen = (relaxed ? matched : inBudget).stream()
                .sorted(Comparator.<Product>comparingInt(product -> -scores.get(product.getId()))
                        .thenComparing(product -> minPrice(variants.get(product.getId()))))
                .limit(relaxed ? 3 : TOP_K)
                .toList();

        boolean noNeed = need.category() == null && need.brand() == null && need.maxBudget() == null
                && need.minBudget() == null && camera == null
                && chosen.stream().allMatch(product -> scores.get(product.getId()) == 0);
        if (noNeed) {
            chosen = List.of();
        }

        List<CatalogItem> items = chosen.stream()
                .map(product -> toItem(product, variants.getOrDefault(product.getId(), List.of())))
                .toList();
        return new Retrieval(need, items, relaxed);
    }

    public static String normalize(String text) {
        String noMarks = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "");
        return noMarks.replace('đ', 'd').replace('Đ', 'D').toLowerCase();
    }

    static String detectCategory(String text) {
        if (text.matches(".*(the nho|the sd|\\bsd\\b|memory card|\\bthe\\b.*(gb|tb)).*")) {
            return CARD;
        }
        if (text.matches(".*(\\bpin\\b|\\bsac\\b|battery|charger).*")) {
            return BATTERY;
        }
        if (text.matches(".*(ong kinh|\\blens\\b|tieu cu|ong zoom|ong fix|ong chan dung).*")) {
            return LENS;
        }
        if (text.matches(".*(may anh|camera|body|than may|may chup|mirrorless).*")) {
            return CAMERA;
        }
        return null;
    }

    static String detectBrand(String text) {
        if (text.matches(".*\\bsony\\b.*")) return "Sony";
        if (text.matches(".*\\bcanon\\b.*")) return "Canon";
        if (text.matches(".*\\bnikon\\b.*")) return "Nikon";
        if (text.matches(".*\\bfuji(film)?\\b.*")) return "Fujifilm";
        if (text.matches(".*\\bsandisk\\b.*")) return "SanDisk";
        return null;
    }

    static BigDecimal[] detectBudget(String text) {
        List<BigDecimal> amounts = new ArrayList<>();
        List<Integer> positions = new ArrayList<>();
        Matcher millions = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(trieu|tr|cu)\\b").matcher(text);
        while (millions.find()) {
            amounts.add(new BigDecimal(millions.group(1).replace(',', '.')).multiply(MILLION));
            positions.add(millions.start());
        }
        Matcher plain = Pattern.compile("\\b(\\d{1,3}(?:[.,]\\d{3}){2,})\\s*(d|vnd|dong)?\\b").matcher(text);
        while (plain.find()) {
            amounts.add(new BigDecimal(plain.group(1).replaceAll("[.,]", "")));
            positions.add(plain.start());
        }
        Matcher range = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(?:-|den|toi)\\s*(\\d+(?:[.,]\\d+)?)\\s*(trieu|tr|cu)\\b").matcher(text);
        if (range.find()) {
            BigDecimal low = new BigDecimal(range.group(1).replace(',', '.')).multiply(MILLION);
            BigDecimal high = new BigDecimal(range.group(2).replace(',', '.')).multiply(MILLION);
            return new BigDecimal[] {low.min(high), low.max(high)};
        }
        if (amounts.isEmpty()) {
            return null;
        }
        if (amounts.size() >= 2) {
            BigDecimal a = amounts.get(0);
            BigDecimal b = amounts.get(1);
            return new BigDecimal[] {a.min(b), a.max(b)};
        }
        BigDecimal amount = amounts.get(0);
        String before = text.substring(Math.max(0, positions.get(0) - 20), positions.get(0));
        if (before.matches(".*(tren|tu|hon|it nhat|toi thieu)\\s*$")) {
            return new BigDecimal[] {amount, null};
        }
        if (before.matches(".*(duoi|toi da|khong qua|max|nho hon|it hon)\\s*$")) {
            return new BigDecimal[] {null, amount};
        }
        return new BigDecimal[] {null, amount.multiply(BigDecimal.valueOf(1.1))};
    }

    static Product findMentionedCamera(String text, List<Product> products) {
        String compact = compact(text);
        Product best = null;
        int bestLength = 0;
        for (Product product : products) {
            if (!CAMERA.equals(product.getCategory().getName())) {
                continue;
            }
            String model = modelCode(product.getName());
            if (model.length() >= 2 && compact.contains(model) && model.length() > bestLength) {
                best = product;
                bestLength = model.length();
            }
        }
        return best;
    }

    public static String modelCode(String productName) {
        String name = normalize(productName)
                .replaceFirst("^(sony|canon|nikon|fujifilm)\\s+", "")
                .replaceFirst("^eos\\s+", "")
                .replace("alpha ", "a");
        return compact(name);
    }

    private static String compact(String text) {
        return text.replaceAll("[^a-z0-9]", "");
    }

    private static boolean fits(Product product, Need need, Product camera) {
        String category = product.getCategory().getName();
        if (need.category() != null && !need.category().equals(category)) {
            return false;
        }
        if (camera != null && LENS.equals(category)) {
            return camera.getMount() != null && product.getMount() != null
                    && camera.getMount().getId().equals(product.getMount().getId());
        }
        if (camera != null && BATTERY.equals(category)) {
            return product.getCompatibleCameras().stream().anyMatch(c -> c.getId().equals(camera.getId()));
        }
        return need.brand() == null || need.brand().equals(product.getBrand().getName());
    }

    private static boolean withinBudget(BigDecimal price, Need need) {
        if (price == null) {
            return false;
        }
        boolean aboveMin = need.minBudget() == null || price.compareTo(need.minBudget()) >= 0;
        boolean belowMax = need.maxBudget() == null || price.compareTo(need.maxBudget()) <= 0;
        return aboveMin && belowMax;
    }

    private static final Set<String> STOP_WORDS = Set.of(
            "cho", "toi", "minh", "em", "anh", "chi", "ban", "shop", "muon", "can", "nen", "mua", "nao", "gi", "the",
            "duoi", "tren", "trieu", "khoang", "tam", "gia", "re", "hay", "voi", "duoc", "khong", "co", "la", "va",
            "mot", "nhung", "nhu", "de", "dang", "dung", "may", "ong", "kinh", "pin", "sac", "nho", "loai", "con",
            "hon", "nhat", "tu", "den", "thi", "ma", "giup", "van", "xin", "chao", "oi", "nhe", "di");

    private static Set<String> keywords(String text) {
        Set<String> words = new HashSet<>();
        for (String word : text.split("[^a-z0-9]+")) {
            if (word.length() >= 2 && !STOP_WORDS.contains(word)) {
                words.add(word);
            }
        }
        if (text.contains("chan dung") || text.contains("xoa phong") || text.contains("portrait")) words.add("#portrait");
        if (text.matches(".*(vlog|youtube|tiktok|quay video|quay phim|livestream).*")) words.add("#video");
        if (text.matches(".*(nguoi moi|moi hoc|moi bat dau|nhap mon|beginner).*")) words.add("#beginner");
        if (text.matches(".*(du lich|nho gon|nhe|mang theo).*")) words.add("#travel");
        return words;
    }

    private static int score(Product product, Set<String> keywords, Product camera) {
        String haystack = normalize(product.getName() + " " + (product.getDescription() == null ? "" : product.getDescription())
                + " " + product.getSpecs().stream().map(spec -> spec.getLabel() + " " + spec.getValue())
                        .collect(Collectors.joining(" ")));
        int score = 0;
        for (String keyword : keywords) {
            if (keyword.startsWith("#")) {
                continue;
            }
            Matcher hits = Pattern.compile("\\b" + Pattern.quote(keyword) + "\\b").matcher(haystack);
            int count = 0;
            while (count < 3 && hits.find()) {
                count++;
            }
            score += 2 * count;
        }
        boolean isLens = LENS.equals(product.getCategory().getName());
        boolean isCamera = CAMERA.equals(product.getCategory().getName());
        if (keywords.contains("#portrait") && isLens && haystack.matches(".*(f1\\.4|f1\\.8|f/1\\.4|f/1\\.8|chan dung|xoa phong).*")) {
            score += 4;
        }
        if (keywords.contains("#video") && haystack.matches(".*(vlog|4k|quay doc|micro).*")) {
            score += isCamera && haystack.contains("vlog") ? 5 : 2;
        }
        if (keywords.contains("#beginner") && isCamera && haystack.matches(".*(aps-c).*")) {
            score += 2;
        }
        if (keywords.contains("#travel") && haystack.matches(".*(nho gon|nhe|du lich).*")) {
            score += 2;
        }
        if (camera != null && product.getId().equals(camera.getId())) {
            score += 3;
        }
        return score;
    }

    private static BigDecimal minPrice(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return null;
        }
        return variants.stream().map(variant -> variant.getPrice()).min(Comparator.naturalOrder()).orElse(null);
    }

    private static CatalogItem toItem(Product product, List<ProductVariant> variants) {
        List<VariantInfo> variantInfos = variants.stream()
                .sorted(Comparator.comparing(variant -> variant.getPrice()))
                .map(variant -> new VariantInfo(variant.getName(), variant.getPrice(), variant.getStock() > 0))
                .toList();
        return new CatalogItem(
                product.getId(),
                product.getName(),
                product.getBrand().getName(),
                product.getCategory().getName(),
                product.getMount() == null ? null : product.getMount().getName(),
                product.getImageUrl(),
                product.getDescription(),
                minPrice(variants),
                variantInfos,
                highlights(product.getSpecs()));
    }

    private static List<String> highlights(List<ProductSpec> specs) {
        Map<String, String> firstOfGroup = new LinkedHashMap<>();
        for (ProductSpec spec : specs) {
            String group = spec.getGroupName() == null ? spec.getLabel() : spec.getGroupName();
            firstOfGroup.putIfAbsent(group, spec.getLabel() + ": " + spec.getValue());
        }
        List<String> result = new ArrayList<>(firstOfGroup.values());
        specs.stream()
                .filter(spec -> spec.getLabel().equals("Trọng lượng") || spec.getLabel().equals("Chống rung"))
                .forEach(spec -> result.add(spec.getLabel() + ": " + spec.getValue()));
        return result.stream().distinct().limit(8).toList();
    }
}
