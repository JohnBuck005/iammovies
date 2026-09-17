package com.iamoviestory.app;

import android.graphics.Color;
import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Dark background on the WebView to prevent white flash while loading
        try {
            WebView webView = getBridge().getWebView();
            webView.setBackgroundColor(Color.parseColor("#0a0a0a"));
        } catch (Exception e) {
            // Fallback — set window background
            getWindow().getDecorView().setBackgroundColor(Color.parseColor("#0a0a0a"));
        }
    }
}
