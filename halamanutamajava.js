document.addEventListener("DOMContentLoaded", function() {
    const url = "https://api.thingspeak.com/channels/2566396/feeds.json?api_key=AQ3SV4JV3Z6341SS&results=1";

    let previousValues = {
        suhu: null,
        kelembaban: null,
        tekananUdara: null,
        karbonDioksida: null,
        pm25: null
    };

    function createChart(ctx, label, maxValue) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [label, ''],
                datasets: [{
                    data: [0, maxValue], // Awalnya akan ditampilkan sebagai 0
                    backgroundColor: ['green', '#E0E0E0'],
                    borderWidth: 0
                }]
            },
            options: {
                cutoutPercentage: 80,
                tooltips: { enabled: false },
                hover: { mode: null },
                legend: { display: false },
                plugins: {
                    datalabels: {
                        color: 'white', // Warna teks
                        textAlign: 'center',
                        font: {
                            size: '20'
                        },
                        formatter: (value) => value // Fungsi formatter untuk memformat nilai
                    }
                }
            }
        });
    }

    function updateChart(chart, data, maxValue, labelElementId) {
        // Menyesuaikan nilai data agar tidak melebihi nilai maksimum
        const updatedData = Math.min(data, maxValue);
        chart.data.datasets[0].data = [updatedData, maxValue - updatedData];
        chart.update();

        // Perbarui nilai-nilai di tengah grafik
        document.getElementById(labelElementId).innerText = updatedData;
    }

    function fetchDataAndUpdateCharts() {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const feeds = data.feeds[0];
                const suhu = parseFloat(feeds.field1);
                const kelembaban = parseFloat(feeds.field2);
                const tekananUdara = parseFloat(feeds.field3);
                const karbonDioksida = parseFloat(feeds.field5);
                const pm25 = parseFloat(feeds.field6);

                // Tentukan batas maksimal untuk setiap parameter
                const suhuMax = 50; // Misalnya, batas maksimal suhu adalah 50 derajat Celsius
                const kelembabanMax = 100; // Batas maksimal kelembaban dalam persen
                const tekananUdaraMax = 1030; // Misalnya, batas maksimal tekanan udara adalah 1200 Pa
                const karbonDioksidaMax = 2000; // Misalnya, batas maksimal karbon dioksida adalah 2000 ppm
                const pm25Max = 400; // Misalnya, batas maksimal PM2.5 adalah 50 µg/m³

                // Cek apakah nilai adalah NaN, jika ya, gunakan nilai sebelumnya
                if (!isNaN(suhu)) {
                    previousValues.suhu = suhu;
                    updateChart(suhuChart, suhu, suhuMax, 'suhu-label');
                }
                if (!isNaN(kelembaban)) {
                    previousValues.kelembaban = kelembaban;
                    updateChart(kelembabanChart, kelembaban, kelembabanMax, 'kelembaban-label');
                }
                if (!isNaN(tekananUdara)) {
                    previousValues.tekananUdara = tekananUdara;
                    updateChart(tekananUdaraChart, tekananUdara, tekananUdaraMax, 'tekananUdara-label');
                }
                if (!isNaN(karbonDioksida)) {
                    previousValues.karbonDioksida = karbonDioksida;
                    updateChart(karbonDioksidaChart, karbonDioksida, karbonDioksidaMax, 'karbonDioksida-label');
                }
                
                if (!isNaN(pm25)) {
                    previousValues.pm25 = pm25;
                    updateChart(pm25Chart, pm25, pm25Max, 'pm25-label');
                }
            })
            .catch(error => console.error('Error fetching data:', error)); // Tangkap error jika terjadi kesalahan saat mengambil data
    }

    // Membuat dan menginisialisasi grafik dengan batas maksimal
    const suhuChart = createChart(document.getElementById('suhuChart').getContext('2d'), 'Temp', 50);
    const kelembabanChart = createChart(document.getElementById('kelembabanChart').getContext('2d'), 'Hum', 100);
    const tekananUdaraChart = createChart(document.getElementById('tekananUdaraChart').getContext('2d'), 'Press', 1030);
    const karbonDioksidaChart = createChart(document.getElementById('karbonDioksidaChart').getContext('2d'), 'CO2', 2000);
    const pm25Chart = createChart(document.getElementById('pm25Chart').getContext('2d'), 'PM25', 400);

    fetchDataAndUpdateCharts(); // Ambil dan tampilkan data untuk pertama kali
    setInterval(fetchDataAndUpdateCharts, 10000); // Atur interval untuk memperbarui data setiap beberapa detik (misalnya, setiap 2 detik)
});
