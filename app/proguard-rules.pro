# Keep RevenueCat models
-keep class com.revenuecat.** { *; }
# Keep Firebase Firestore models
-keepclassmembers class * { @com.google.firebase.firestore.PropertyName <fields>; }