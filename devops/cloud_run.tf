data "google_container_registry_image" "backend" {
  name   = var.image_name
  region = "us"
}

resource "google_cloud_run_service" "backend" {
  name     = "backend-${var.name}-server"
  location = "northamerica-northeast1"


  template {
    spec {
      containers {
        image = data.google_container_registry_image.backend.image_url
        ports {
          container_port = 8000
        }
      }
    }
  }
}

resource "google_cloud_run_service_iam_member" "allUsers" {
  service  = google_cloud_run_service.backend.name
  location = google_cloud_run_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_compute_global_address" "backend" {
  name         = "backend-${var.name}-address"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}

resource "google_compute_managed_ssl_certificate" "backend" {
  provider = google-beta
  name     = "backend-${var.name}-certificate"

  managed {
    domains = [var.backend_hostname]
  }
}

resource "google_compute_region_network_endpoint_group" "cloudrun_neg" {
  provider              = google-beta
  name                  = "backend-${var.name}-neg"
  network_endpoint_type = "SERVERLESS"
  region                = "northamerica-northeast1"

  cloud_run {
    service = google_cloud_run_service.backend.name
  }
}

resource "google_compute_backend_service" "backend" {
  name        = var.name

  protocol    = "HTTP"
  port_name   = "http"
  timeout_sec = 30

  backend {
    group = google_compute_region_network_endpoint_group.cloudrun_neg.id
  }
}


resource "google_compute_target_https_proxy" "backend" {
  name = "backend-${var.name}-https-proxy"
  url_map = google_compute_url_map.default.id

  ssl_certificates = [
    google_compute_managed_ssl_certificate.backend.id
  ]
}

resource "google_compute_global_forwarding_rule" "backend" {
  name = "backend-${var.name}-lb"

  target     = google_compute_target_https_proxy.backend.id
  port_range = "443"
  ip_address = google_compute_global_address.backend.address
}

resource "google_dns_record_set" "backend" {
  managed_zone = "access-it"
  name         = "${var.backend_hostname}."
  type         = "A"
  ttl          = 3600
  rrdatas      = [google_compute_global_address.backend.address]
}
