// 404 page.

import StatusPage from "@/components/StatusPage";

export default function NotFound() {
  return (
    <StatusPage code="404" title="Không tìm thấy trang" message="Trang hoặc sản phẩm bạn tìm không tồn tại hoặc đã bị gỡ." />
  );
}
