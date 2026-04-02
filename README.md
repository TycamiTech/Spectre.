# 👻 Spectre - TikTok Video Downloader

**Premium quality. No watermark. Zero Ads.**

Spectre adalah aplikasi web pengunduh video dan audio TikTok yang dirancang dengan fokus pada pengalaman pengguna. Menawarkan antarmuka *dark mode* yang minimalis dan elegan, Spectre memungkinkan pengguna untuk mengunduh konten favorit mereka (MP4 maupun MP3) secara gratis tanpa gangguan iklan sama sekali.

---

##  Fitur Utama (Key Features)

* ** Tanpa Iklan (Ad-Free):** Pengalaman mengunduh yang bersih dan tidak mengganggu.
* ** Tanpa Watermark:** Unduh video MP4 dalam kualitas aslinya tanpa logo TikTok.
* ** Ekstraksi Audio (MP3):** Konversi dan unduh suara/musik dari video langsung menjadi format MP3.
* ** Cepat & Responsif:** Antarmuka pengguna yang dioptimalkan untuk berbagai perangkat (PC maupun Mobile).
* ** 100% Gratis:** Seluruh fitur premium dapat diakses tanpa biaya.

---

## 🛠️ Arsitektur Sistem (How It Works)

Berikut adalah alur kerja sederhana dari Spectre saat memproses tautan TikTok dari pengguna:

```mermaid
graph TD
    A([👤 Pengguna]) -->|1. Paste URL TikTok| B(💻 Antarmuka Spectre)
    B -->|2. Request URL| C{⚙️ Backend / API Ekstraktor}
    
    C -->|3a. Ekstraksi Video| D[🎥 Video MP4 No Watermark]
    C -->|3b. Ekstraksi Audio| E[🎵 Audio MP3]
    
    D --> F([📥 Unduh ke Perangkat])
    E --> F([📥 Unduh ke Perangkat])
    
    classDef ui fill:#1e1e1e,stroke:#fff,stroke-width:2px,color:#fff;
    classDef api fill:#2d3436,stroke:#74b9ff,stroke-width:2px,color:#fff;
    classDef media fill:#0984e3,stroke:#fff,stroke-width:2px,color:#fff;
    
    class B ui;
    class C api;
    class D,E media;
