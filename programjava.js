// Fungsi untuk menampilkan tabel data suhu
function drawDataTable(data) {
    var tableBody = document.getElementById('data-table-body');
    tableBody.innerHTML = '';

    for (var i = Math.max(0, data.length - 10); i < data.length; i++) {
        var rowData = data[i];
        var row = tableBody.insertRow();
        var numberCell = row.insertCell();
        var timeCell = row.insertCell();
        var tempCell = row.insertCell();

        numberCell.textContent = i + 1;
        timeCell.textContent = new Date(rowData.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        tempCell.textContent = rowData.field1;
    }
}
function updateIconColor(value) {
    var icon1 = document.getElementById("person-icon-1");
    var icon2 = document.getElementById("person-icon-2");
    var icon3 = document.getElementById("person-icon-3");

    var text1 = document.getElementById("prediction-text-1");
    var text2 = document.getElementById("prediction-text-2");
    var text3 = document.getElementById("prediction-text-3");

     // Hapus semua kelas warna dan kedap-kedip
     [icon1, icon2, icon3].forEach(icon => {
        icon.classList.remove("green", "yellow","red", "flashing");
    });

    // Set semua teks prediksi ke string kosong
    [text1, text2, text3].forEach(text => {
        text.textContent = '';
    });

    if (value === 1) {
        icon1.classList.add("green", "flashing"); // Setel ikon 1 menjadi biru
        icon2.classList.add("green","flashing"); // Setel ikon 2 menjadi hijau
        icon3.classList.add("green","flashing"); // Setel ikon 3 menjadi hijau
        text1.textContent = 'Predt 1';

    } else if (value === 2) {
        icon1.classList.add("yellow", "flashing"); // Setel ikon 1 menjadi biru
        icon2.classList.add("yellow", "flashing"); // Setel ikon 2 menjadi biru
        icon3.classList.add("yellow", "flashing"); // Setel ikon 3 menjadi hijau
        text2.textContent = 'Predt 2';
    } else if (value === 3) {
        icon1.classList.add("red", "flashing"); // Setel ikon 1 menjadi biru
        icon2.classList.add("red", "flashing"); // Setel ikon 2 menjadi biru
        icon3.classList.add("red", "flashing"); // Setel ikon 3 menjadi biru
        text3.textContent = 'Predt 3';
    }
}
// Simpan referensi ke instance grafik agar dapat diperbarui
let temperatureChart;
let maxTemperatureChart;
let minTemperatureChart;
let avgTemperatureChart;
let temperatureHistogram;

function showTemperatureChart() {
    var url1 = "https://api.thingspeak.com/channels/2566396/feeds.json?api_key=AQ3SV4JV3Z6341SS";
    var url2 = "https://api.thingspeak.com/channels/2461739/feeds.json?api_key=Y7R0L1U8V9J1X6D3";

    Promise.all([
        fetch(url1).then(response => response.json()),
        fetch(url2).then(response => response.json())
    ])
    .then(results => {
        var data = results[0].feeds;
        var data1 = results[1].feeds;
        
        var validData = data.filter(entry => !isNaN(parseFloat(entry.field1)));
        var validData1 = data1.filter(entry => !isNaN(parseFloat(entry.field3)));
        
        drawTemperatureChart(validData);
        drawTemperatureHistogram(validData);
        drawDataTable(validData);

        // Perbarui indikator berdasarkan nilai terbaru dari validData2
        if (validData1.length > 0) {
            var latestValue = parseFloat(validData1[validData1.length - 1].field3);
            updateIconColor(latestValue);
        }
    })
    .catch(error => console.error('Error:', error));
}
// Fungsi untuk menggambar grafik suhu menggunakan Chart.js
function drawTemperatureChart(data) {
    var labels = [];
    var temperatures = [];
    
    data.forEach(entry => {
        var time = new Date(entry.created_at);
        labels.push(time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
        temperatures.push(parseFloat(entry.field1));
    });
    
    var maxTemperature = Math.max(...temperatures);
    var minTemperature = Math.min(...temperatures);
    var avgTemperature = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;

    var ctx = document.getElementById('suhu-chart').getContext('2d');
    if (temperatureChart) {
        temperatureChart.data.labels = labels;
        temperatureChart.data.datasets[0].data = temperatures;
        temperatureChart.update();
    } else {
        temperatureChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Suhu',
                    data: temperatures,
                    borderColor: 'rgb(3, 141, 183)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'H:mm'
                            }
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Waktu'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Suhu (°C)'
                        }
                    }]
                }
            }
        });
    }

    drawCircleChart('max-temperature-chart', maxTemperature, 'Max', maxTemperatureChart);
    drawCircleChart('min-temperature-chart', minTemperature, 'Min', minTemperatureChart);
    drawCircleChart('avg-temperature-chart', avgTemperature, 'Avg', avgTemperatureChart);
}

// Fungsi untuk menggambar grafik lingkaran
function drawCircleChart(elementId, value, label, chartInstance) {
    var ctx = document.getElementById(elementId).getContext('2d');
    if (chartInstance) {
        chartInstance.data.datasets[0].data = [value, 50 - value];
        chartInstance.update();
    } else {
        chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [value, 50 - value],
                    backgroundColor: [
                        'white',
                        'rgb(21, 21, 71)',
                    ]
                }],
                labels: [label, '']
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        });
    }

    var dataValueElement = document.getElementById(elementId.replace('-chart', '-data-value'));
    dataValueElement.innerText = value.toFixed(2);

    if (elementId === 'max-temperature-chart') {
        maxTemperatureChart = chartInstance;
    } else if (elementId === 'min-temperature-chart') {
        minTemperatureChart = chartInstance;
    } else if (elementId === 'avg-temperature-chart') {
        avgTemperatureChart = chartInstance;
    }
}

// Fungsi untuk menggambar grafik batang (histogram)
function drawTemperatureHistogram(data) {
    var ranges = {
        '20-23': 0,
        '24-27': 0,
        '28-31': 0,
        '32-35': 0,
        '36-39': 0,
        '40-43': 0,
        '44-47': 0,
        '48-50': 0
    };

    data.forEach(entry => {
        var value = parseFloat(entry.field1);

        if (value >= 20 && value <= 23) ranges['20-23']++;
        else if (value >= 24 && value <= 27) ranges['24-27']++;
        else if (value >= 28 && value <= 31) ranges['28-31']++;
        else if (value >= 32 && value <= 35) ranges['32-35']++;
        else if (value >= 36 && value <= 39) ranges['36-39']++;
        else if (value >= 40 && value <= 43) ranges['40-43']++;
        else if (value >= 44 && value <= 47) ranges['44-47']++;
        else if (value >= 48 && value <= 50) ranges['48-50']++;
    });

    var ctx = document.getElementById('temperature-histogram').getContext('2d');
    if (temperatureHistogram) {
        temperatureHistogram.data.datasets[0].data = Object.values(ranges);
        temperatureHistogram.update();
    } else {
        temperatureHistogram = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(ranges),
                datasets: [{
                    label: 'Suhu (°C)',
                    data: Object.values(ranges),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Rentang Suhu (°C)'
                        }
                    }],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Jumlah Pembacaan'
                        },
                        ticks: {
                            beginAtZero: true,
                            precision: 0 // Menampilkan angka bulat pada sumbu y
                        }
                    }]
                }
            }
        });
    }
}

// Memanggil fungsi untuk memperbarui data setiap 15 detik
setInterval(showTemperatureChart, 10000);

// Panggil fungsi pertama kali saat halaman dimuat
showTemperatureChart();
