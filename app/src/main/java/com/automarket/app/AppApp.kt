package com.automarket.app

import android.app.Application
import com.revenuecat.purchases.Purchases
import com.revenuecat.purchases.PurchasesConfiguration

class AppApp : Application() {
    override fun onCreate() {
        super.onCreate()
        
        // Configurar RevenueCat
        Purchases.configure(
            PurchasesConfiguration.Builder(this, "REPLACE_WITH_YOUR_API_KEY")
                .build()
        )
    }
}