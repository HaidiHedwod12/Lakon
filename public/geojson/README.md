# GeoJSON Boundary Files

Folder ini berisi file-file GeoJSON untuk menampilkan batas wilayah di aplikasi LAKON.

## File yang Tersedia

### `surakarta-boundary.geojson`
File GeoJSON untuk batas wilayah Kota Surakarta.

## Cara Menggunakan

1. **Ganti File GeoJSON**: 
   - Ganti file `surakarta-boundary.geojson` dengan file GeoJSON Anda sendiri
   - Pastikan format GeoJSON valid dan menggunakan koordinat WGS84 (longitude, latitude)

2. **Format GeoJSON yang Didukung**:
   ```json
   {
     "type": "FeatureCollection",
     "features": [
       {
         "type": "Feature",
         "properties": {
           "name": "Nama Wilayah",
           "province": "Provinsi",
           "area_km2": 44.04,
           "population": 552118,
           "description": "Deskripsi wilayah"
         },
         "geometry": {
           "type": "Polygon",
           "coordinates": [
             [
               [longitude1, latitude1],
               [longitude2, latitude2],
               [longitude3, latitude3],
               [longitude1, latitude1]
             ]
           ]
         }
       }
     ]
   }
   ```

3. **Fitur di Aplikasi**:
   - Toggle on/off boundary layer di sidebar
   - Atur transparansi polygon (10% - 100%)
   - Popup informasi wilayah saat diklik
   - Legend yang menampilkan status layer

## Tips

- Koordinat harus dalam format [longitude, latitude]
- Polygon harus tertutup (titik pertama = titik terakhir)
- Gunakan koordinat yang akurat untuk hasil terbaik
- File GeoJSON harus valid untuk menghindari error 