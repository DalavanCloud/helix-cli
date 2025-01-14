# This file handles the strain resolution
set req.http.X-Root-Path = "";
if (req.http.Host == "www.example.com") {
  set req.http.X-Sticky = "false";
  set req.http.X-Strain = "default";
} else if (req.http.Host == "www.new-site.com" && (req.http.X-FullDirname ~ "^/old-stuff$" || req.http.X-FullDirname ~ "^/old-stuff/")) {
  set req.http.X-Dirname = regsub(req.http.X-FullDirname, "^/old-stuff", "");
  set req.http.X-Root-Path = "/old-stuff";
  
  # Enable passing through of requests
  
  set req.http.X-Proxy = "https://192.168.100.1:4503/";
  set req.http.X-Static = "Proxy";
  
  set req.backend = F_Proxy1921681001f402;
  set req.http.host = "192.168.100.1";
  
  set req.http.X-Sticky = "false";
  set req.http.X-Strain = "proxy";
} else {
  set req.http.X-Strain = "default";
}
