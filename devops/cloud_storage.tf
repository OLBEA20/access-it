
resource "google_storage_bucket" "frontend" {
  name          = var.frontend_hostname
  location      = "US"
  force_destroy = true

  uniform_bucket_level_access = true
}


resource "google_compute_backend_bucket" "cdn_backend_bucket" {
  name        = "cdn-backend-bucket"
  bucket_name = google_storage_bucket.frontend.name
  enable_cdn  = true
}


resource "google_compute_managed_ssl_certificate" "cdn_certificate" {
  provider = google-beta

  name = "frontend-${var.name}-certificate"

  managed {
    domains = [var.frontend_hostname]
  }
}


resource "google_compute_target_https_proxy" "cdn_https_proxy" {
  name             = "frontend-${var.name}-https-proxy"
  url_map          = google_compute_url_map.default.self_link
  ssl_certificates = [google_compute_managed_ssl_certificate.cdn_certificate.self_link]
}

resource "google_compute_global_address" "cdn_public_address" {
  name         = "cdn-public-address"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}


resource "google_compute_global_forwarding_rule" "cdn_global_forwarding_rule" {
  name       = "frontend-${var.name}-lb"
  target     = google_compute_target_https_proxy.cdn_https_proxy.self_link
  ip_address = google_compute_global_address.cdn_public_address.address
  port_range = "443"
}

resource "google_dns_record_set" "cdn_dns_a_record" {
  managed_zone = "access-it"
  name         = "${var.frontend_hostname}."
  type         = "A"
  ttl          = 3600
  rrdatas      = [google_compute_global_address.cdn_public_address.address]
}

resource "google_storage_bucket_iam_member" "all_users_viewers_legacy" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.legacyObjectReader"
  member = "allUsers"
}

resource "google_storage_bucket_iam_member" "all_users_viewers" {
  bucket = google_storage_bucket.frontend.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}