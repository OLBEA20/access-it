resource "google_compute_url_map" "default" {
  name = "${var.name}-urlmap"

  default_service = google_compute_backend_bucket.cdn_backend_bucket.self_link

  host_rule {
    hosts        = [var.frontend_hostname]
    path_matcher = "frontend"
  }

  host_rule {
    hosts        = [var.backend_hostname]
    path_matcher = "backend"
  }

  path_matcher {
    name            = "frontend"
    default_service = google_compute_backend_bucket.cdn_backend_bucket.self_link

  }

  path_matcher {
    name            = "backend"
    default_service = google_compute_backend_service.backend.id
  }
}