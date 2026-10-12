// All filter options (brands, categories, mounts) in one response.

package com.camerashop.dto.product;

import java.util.List;

import com.camerashop.dto.common.OptionDTO;

public record FilterOptionsDTO(
        List<OptionDTO> brands,
        List<OptionDTO> categories,
        List<OptionDTO> mounts) {
}
