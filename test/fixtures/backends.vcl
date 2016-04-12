backend falcon {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "render.prod.ft.com";
  .host_header = "www.ft.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /itm/site_status.html HTTP/1.1" "Host: render.prod.ft.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}

backend ig {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "ig.ft.com";
  .host_header = "www.ft.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /sureroute.html HTTP/1.1" "Host: ig.ft.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}

backend ads_s3_bucket {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "com.ft.ads-static-content.s3-website-eu-west-1.amazonaws.com";
  .host_header = "com.ft.ads-static-content.s3-website-eu-west-1.amazonaws.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /indexdg.html HTTP/1.1" "Host: com.ft.ads-static-content.s3-website-eu-west-1.amazonaws.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}

backend access {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "access.ft.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /__gtg HTTP/1.1" "Host: access.ft.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}

backend fastft {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "fastft.glb.ft.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /__gtg/ HTTP/1.1" "Host: fastft.glb.ft.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}


backend access_test {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "access.test.ft.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /__gtg HTTP/1.1" "Host: access.test.ft.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}

backend test {
  .connect_timeout = 3s;
  .dynamic = true;
  .port = "80";
  .host = "ft-next-narcissus.herokuapp.com";
  .host_header = "ft-next-narcissus.herokuapp.com";
  .first_byte_timeout = 15s;
  .max_connections = 200;
  .between_bytes_timeout = 10s;
  .share_key = "f8585BOxnGQDMbnkJoM1e";

  .probe = {
    .request = "HEAD /__gtg HTTP/1.1" "Host: ft-next-narcissus.herokuapp.com" "Connection: close" "User-Agent: Varnish/fastly (healthcheck)";
    .threshold = 1;
    .window = 2;
    .timeout = 5s;
    .initial = 1;
    .expected_response = 200;
    .interval = 10s;
  }
}