package com.dewaban.pos;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import android.Manifest;
import android.app.AlertDialog;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.net.http.SslError;
import android.os.Build;
import android.os.Bundle;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JsResult;
import android.webkit.SslErrorHandler;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import com.dantsu.escposprinter.EscPosPrinter;
import com.dantsu.escposprinter.connection.bluetooth.BluetoothConnection;
import com.dantsu.escposprinter.connection.bluetooth.BluetoothPrintersConnections;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "DEWABAN_POS";
    private WebView myWebView;
    // URL PWA yang di-host di GitHub Pages
    private static final String PWA_URL = "https://infantrie111.github.io/dewa-ban-kasir/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Setup WebView Full Screen
        myWebView = new WebView(this);
        setContentView(myWebView);

        // ============================================================
        // KONFIGURASI WEBVIEW - LENGKAP & KOMPREHENSIF
        // ============================================================
        WebSettings webSettings = myWebView.getSettings();

        // --- CORE: JavaScript & DOM Storage (WAJIB untuk PWA/Kasir) ---
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // --- DATABASE & CACHE ---
        webSettings.setDatabaseEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // --- AKSES FILE (untuk aset lokal jika diperlukan) ---
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);

        // --- MIXED CONTENT (izinkan HTTPS memuat HTTP jika ada) ---
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // --- RENDERING & LAYOUT ---
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);

        // --- MEDIA (untuk fitur future jika ada kamera barcode dll) ---
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);

        // --- USER AGENT (identifikasi sebagai app native) ---
        String defaultUA = webSettings.getUserAgentString();
        webSettings.setUserAgentString(defaultUA + " DewaBanPOS/1.0");

        // ============================================================
        // WEBVIEW CLIENT - Menangani navigasi & error
        // ============================================================
        myWebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                Log.d(TAG, "📄 Page loading: " + url);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "✅ Page loaded: " + url);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                // Hanya tangani error pada main frame (bukan sub-resource)
                if (request.isForMainFrame()) {
                    String errorMsg = "";
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        errorMsg = error.getDescription().toString();
                        Log.e(TAG, "❌ Main frame error: " + error.getErrorCode() + " - " + errorMsg);
                    }
                    // Tampilkan halaman error dengan tombol retry
                    showErrorPage(view, "Gagal memuat halaman kasir.\n\nPastikan koneksi internet aktif.\n\nError: " + errorMsg);
                }
            }

            @Override
            public void onReceivedSslError(WebView view, SslErrorHandler handler, SslError error) {
                Log.w(TAG, "⚠️ SSL Error: " + error.toString());
                // Untuk development, proceed. Untuk production, sebaiknya cancel.
                handler.proceed();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                // Tetap di dalam WebView untuk semua URL
                Log.d(TAG, "🔗 Navigate to: " + url);
                return false; // Biarkan WebView yang handle
            }
        });

        // ============================================================
        // WEBCHROMECLIENT - Menangani JS dialogs, console, & progress
        // (KRITIS: Tanpa ini, alert/confirm/prompt JS TIDAK berfungsi
        //  dan beberapa halaman modern gagal render!)
        // ============================================================
        myWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "🌐 JS Console [" + consoleMessage.messageLevel() + "]: "
                        + consoleMessage.message()
                        + " (line " + consoleMessage.lineNumber() + " of " + consoleMessage.sourceId() + ")");
                return true;
            }

            @Override
            public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                // Tampilkan JS alert() sebagai Android Dialog
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("DEWA BAN POS")
                        .setMessage(message)
                        .setPositiveButton("OK", (dialog, which) -> result.confirm())
                        .setCancelable(false)
                        .show();
                return true;
            }

            @Override
            public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                // Tampilkan JS confirm() sebagai Android Dialog
                new AlertDialog.Builder(MainActivity.this)
                        .setTitle("Konfirmasi")
                        .setMessage(message)
                        .setPositiveButton("Ya", (dialog, which) -> result.confirm())
                        .setNegativeButton("Batal", (dialog, which) -> result.cancel())
                        .setCancelable(false)
                        .show();
                return true;
            }
        });

        // ============================================================
        // INJECT JAVASCRIPT INTERFACE
        // ============================================================
        myWebView.addJavascriptInterface(new WebAppInterface(this, this), "Android");

        // ============================================================
        // ENABLE WEBVIEW DEBUGGING (untuk diagnosa via Chrome DevTools)
        // ============================================================
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }

        // ============================================================
        // LOAD URL
        // ============================================================
        Log.d(TAG, "🚀 Loading PWA URL: " + PWA_URL);
        myWebView.loadUrl(PWA_URL);

        // Request Izin Bluetooth saat pertama kali dibuka
        checkBluetoothPermissions();
    }

    /**
     * Menampilkan halaman error lokal dengan tombol Retry
     */
    private void showErrorPage(WebView webView, String errorMessage) {
        String html = "<html><head>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<style>"
                + "body { font-family: sans-serif; display: flex; flex-direction: column; "
                + "  align-items: center; justify-content: center; height: 100vh; margin: 0; "
                + "  background: #1a1a2e; color: #e0e0e0; text-align: center; padding: 20px; }"
                + "h1 { color: #ff6b6b; font-size: 24px; }"
                + "p { color: #aaa; font-size: 14px; max-width: 300px; line-height: 1.6; }"
                + "button { background: #4ecdc4; color: #1a1a2e; border: none; padding: 15px 40px; "
                + "  border-radius: 30px; font-size: 18px; font-weight: bold; cursor: pointer; "
                + "  margin-top: 20px; }"
                + "button:active { background: #45b7aa; }"
                + "</style></head><body>"
                + "<h1>⚠️ Koneksi Gagal</h1>"
                + "<p>" + errorMessage + "</p>"
                + "<button onclick=\"location.href='" + PWA_URL + "'\">🔄 Coba Lagi</button>"
                + "</body></html>";
        webView.loadData(android.util.Base64.encodeToString(html.getBytes(), android.util.Base64.NO_PADDING),
                "text/html", "base64");
    }

    private void checkBluetoothPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{
                    Manifest.permission.BLUETOOTH_CONNECT,
                    Manifest.permission.BLUETOOTH_SCAN
                }, 1);
            }
        }
    }

    // Fungsi yang dipanggil dari WebAppInterface
    public void printFromJavascript(String base64Data) {
        runOnUiThread(() -> {
            try {
                // 0. Cek Izin (PENTING UNTUK ANDROID 12+)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    if (ContextCompat.checkSelfPermission(this, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                        Toast.makeText(this, "Izin Bluetooth belum diberikan! Harap terima izin di layar.", Toast.LENGTH_LONG).show();
                        checkBluetoothPermissions();
                        return;
                    }
                }

                // 1. Decode Base64 dari JS menjadi bytes
                byte[] decodedBytes = Base64.decode(base64Data, Base64.DEFAULT);

                // 2. Cari Printer Bluetooth yang sedang terhubung/paired
                BluetoothConnection selectedConnection = null;
                try {
                    selectedConnection = BluetoothPrintersConnections.selectFirstPaired();
                } catch (SecurityException e) {
                    Toast.makeText(this, "Gagal akses Bluetooth: Izin ditolak.", Toast.LENGTH_LONG).show();
                    return;
                } catch (Exception e) {
                   Toast.makeText(this, "Gagal mencari printer: " + e.getMessage(), Toast.LENGTH_LONG).show();
                   return;
                }

                if (selectedConnection == null) {
                    Toast.makeText(this, "Printer Bluetooth tidak ditemukan! Pastikan Printer Nyala & sudah Paired di HP.", Toast.LENGTH_LONG).show();
                    return;
                }

                // 3. Kirim Data RAW BYTES langsung ke Socket
                BluetoothConnection finalConnection = selectedConnection;
                new Thread(() -> {
                    try {
                        try {
                            finalConnection.connect();
                            finalConnection.write(decodedBytes);
                            finalConnection.disconnect();
                        } catch (SecurityException se) {
                             runOnUiThread(() -> Toast.makeText(this, "Security Error: Izin Bluetooth hilang.", Toast.LENGTH_LONG).show());
                             return;
                        }
                        runOnUiThread(() -> Toast.makeText(this, "Struk Terkirim 🖨️", Toast.LENGTH_SHORT).show());
                    } catch (Exception e) {
                        e.printStackTrace();
                        runOnUiThread(() -> Toast.makeText(this, "Gagal Print: " + e.getMessage(), Toast.LENGTH_LONG).show());
                    }
                }).start();

            } catch (Exception e) {
                Toast.makeText(this, "Error General: " + e.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    // Handle tombol Back agar navigasi mundur di WebView, bukan keluar app
    @Override
    public void onBackPressed() {
        if (myWebView.canGoBack()) {
            myWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
