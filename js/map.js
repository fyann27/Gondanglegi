// 1. Inisialisasi Peta
// Ganti koordinat [-7.78, 109.55] dengan koordinat pusat desa Gondanglegi
// Ganti zoom level (15) sesuai kebutuhan
const map = L.map('map').setView([-7.78, 109.55], 15);

// 2. Tambahkan Basemap (Peta Dasar)
// Menggunakan OpenStreetMap sebagai basemap gratis
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// 3. Objek untuk Kontrol Layer
// Variabel ini akan menampung layer-layer GeoJSON kita
const overlayMaps = {};

// 4. Memuat Data GeoJSON Penggunaan Lahan
fetch('data/sungai.geojson')
    .then(response => response.json())
    .then(data => {
        const penggunaanLahanLayer = L.geoJson(data, {
            style: function(feature) {
                // Memberi warna berdasarkan properti 'jenis' di GeoJSON
                switch (feature.properties.jenis) {
                    case 'Sawah': return { color: "#2E8B57" }; // Hijau
                    case 'Permukiman': return { color: "#A52A2A" }; // Coklat
                    case 'Tegalan': return { color: "#FFD700" }; // Emas
                    default: return { color: "#808080" }; // Abu-abu
                }
            },
            onEachFeature: function(feature, layer) {
                // Menambahkan popup saat poligon diklik
                if (feature.properties && feature.properties.jenis) {
                    layer.bindPopup("<strong>Penggunaan Lahan:</strong><br>" + feature.properties.jenis);
                }
            }
        }).addTo(map); // Langsung tambahkan ke peta saat pertama dimuat

        // Tambahkan ke objek kontrol layer
        overlayMaps["Penggunaan Lahan"] = penggunaanLahanLayer;
        
        // Setelah semua data dimuat, panggil fungsi untuk menambahkan kontrol layer
        addLayerControl();
    });

// 5. Memuat Data GeoJSON Kemiringan Lereng
fetch('data/kemiringan_lereng.geojson')
    .then(response => response.json())
    .then(data => {
        const kemiringanLerengLayer = L.geoJson(data, {
            style: function(feature) {
                // Memberi warna berdasarkan properti 'keterangan' di GeoJSON
                const kemiringan = feature.properties.kemiringan;
                if (kemiringan < 8) return { color: '#ffffcc' }; // Datar
                if (kemiringan < 15) return { color: '#a1dab4' }; // Landai
                if (kemiringan < 25) return { color: '#41b6c4' }; // Curam
                else return { color: '#225ea8' }; // Sangat Curam
            },
            onEachFeature: function(feature, layer) {
                // Menambahkan popup saat poligon diklik
                if (feature.properties && feature.properties.keterangan) {
                    layer.bindPopup("<strong>Kemiringan Lereng:</strong><br>" + feature.properties.keterangan);
                }
            }
        }); // Layer ini tidak langsung ditambahkan ke peta

        // Tambahkan ke objek kontrol layer
        overlayMaps["Kemiringan Lereng"] = kemiringanLerengLayer;
        
        // Setelah semua data dimuat, panggil fungsi untuk menambahkan kontrol layer
        addLayerControl();
    });


// 6. Fungsi untuk Menambahkan Kontrol Layer ke Peta
// Fungsi ini dipanggil setelah setiap fetch berhasil agar tidak terjadi race condition
let controlAdded = false;
function addLayerControl() {
    // Pastikan kontrol hanya ditambahkan sekali
    if (!controlAdded && Object.keys(overlayMaps).length === 2) {
        L.control.layers(null, overlayMaps, { collapsed: false }).addTo(map);
        controlAdded = true;
    }
}