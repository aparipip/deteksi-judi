// Daftar kata eksplisit terkait judi
const kataJudi = [
    "judi", "slot", "kasino", "poker", "togel", "chip", "bet", "jackpot",
    "spin", "gambling", "taruhan", "roulette", "baccarat", "bandar", "sabung ayam",
    "dewa", "jp", "gacor", "maxwin", "zeus", "wd", "cuan", "judol"
];

// Stopwords dalam Bahasa Indonesia
const stopwordsId = [
    'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'untuk', 'dengan',
    'atau', 'juga', 'ada', 'pada', 'sudah', 'belum', 'karena', 'akan',
    'bisa', 'tidak', 'jadi', 'saja', 'kalau', 'lagi', 'masih', 'yg', 'kalo', 'gak'
];

// Kamus plesetan kata-kata judi
const kamusPlesetan = {
    'gachor': 'gacor', 'gacir': 'gacor', 'gacorr': 'gacor', 'g@cor': 'gacor',
    'g4cor': 'gacor', 'sl0t': 'slot', 'slott': 'slot', 'slottz': 'slot',
    'jaypi': 'jp', 'jep': 'jp', 'jaypee': 'jp', 'j@ypee': 'jp', 'jepe': 'jp',
    'makswin': 'maxwin', 'makwin': 'maxwin', 'makw1n': 'maxwin', 'm4xwin': 'maxwin',
    'sp1n': 'spin', 'spiin': 'spin', 'wede': 'wd', 'z3us': 'zeus', 'cwan': 'cuan',
    'cu4n': 'cuan', 'cw4n': 'cuan'
};

// Emoji mapping untuk menggantikan karakter emoji dengan huruf
const emojiHurufMap = {
    '🅰️': 'a', '🅱️': 'b', '🅾️': 'o', '🅿️': 'p',
    '🆄': 'u', '🅻': 'l', '🅰': 'a', '🆙': 'up', '🆒': 'cool'
};

// Mapping karakter lookalike untuk menggantikan huruf Cyrillic dan bentuk lain
const lookalikeMap = {
    'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H',
    'І': 'I', 'К': 'K', 'М': 'M', 'О': 'O', 'Р': 'P',
    'Т': 'T', 'Х': 'X', 'Я': 'R', '𝙒': 'W', '𝐃': 'D',
    '𝘼': 'A', '𝑂': 'O', '𝘿': 'D', '𝘞': 'W',
    '𝑨': 'A', '𝑩': 'B', '𝑪': 'C', '𝑫': 'D', '𝑬': 'E',
    '𝑭': 'F', '𝑮': 'G', '𝑯': 'H', '𝑰': 'I', '𝑱': 'J',
    '𝑲': 'K', '𝑳': 'L', '𝑴': 'M', '𝑵': 'N', '𝑶': 'O',
    '𝑷': 'P', '𝑸': 'Q', '𝑹': 'R', '𝑺': 'S', '𝑻': 'T',
    '𝑼': 'U', '𝑽': 'V', '𝑾': 'W', '𝑿': 'X', '𝒀': 'Y',
    '𝒁': 'Z'
};

// Menghapus stopwords dari teks
function hapusStopwords(teks) {
    return teks.split(' ').filter(kata => !stopwordsId.includes(kata)).join(' ');
}

// Mengganti plesetan kata judi dalam teks
function gantiPlesetan(teks) {
    return teks.split(' ').map(kata => kamusPlesetan[kata] || kata).join(' ');
}

// Mengonversi emoji ke huruf
function convertEmojiHuruf(teks) {
    return teks.split('').map(c => emojiHurufMap[c] || c).join('');
}

// Mengganti karakter lookalike dengan karakter standar
function translasiLookalike(teks) {
    return teks.split('').map(c => lookalikeMap[c] || c).join('');
}

// Normalisasi teks dengan mengonversi emoji, karakter lookalike, dan penghapusan stopwords
function normalisasiTeks(teks) {
    teks = convertEmojiHuruf(teks);
    teks = translasiLookalike(teks);
    teks = teks.toLowerCase(); // Mengubah semua teks menjadi huruf kecil
    teks = gantiPlesetan(teks); // Ganti kata plesetan
    teks = hapusStopwords(teks); // Hapus stopwords
    teks = teks.replace(/[^\w\s]/g, ''); // Menghapus karakter selain huruf dan angka
    return teks;
}

// Fuzzy Matching: Menghitung kemiripan antara dua string
function fuzzyMatch(a, b) {
    let matches = 0;
    for (let i = 0; i < a.length; i++) {
        if (b[i] && a[i] === b[i]) {
            matches++;
        }
    }
    return (matches / Math.max(a.length, b.length)) * 100;
}

// Fungsi untuk mendeteksi apakah teks mengandung kombinasi kata dan angka
function ada_kata_angka(teks) {
    return /[a-zA-Z]+\d+[a-zA-Z0-9]*/.test(teks); // RegEx untuk kata+angka
}

// Deteksi dengan menggunakan fuzzy matching dan regex
function deteksiFuzzy(teks) {
    const teksAsli = teks;
    teks = normalisasiTeks(teks);
    let bestMatch = { kata: '', score: 0 };

    // Cek kata-kata langsung dalam teks
    kataJudi.forEach(kata => {
        if (teks.includes(kata)) {
            bestMatch.kata = kata;
            bestMatch.score = 100;
        }
    });

    // Fuzzy matching untuk mendeteksi kata judi dalam kalimat
    if (bestMatch.score < 100) {
        kataJudi.forEach(kata => {
            const words = teks.split(' ');
            words.forEach(word => {
                const score = fuzzyMatch(word, kata);
                if (score > bestMatch.score && score >= 70) {
                    bestMatch.kata = kata;
                    bestMatch.score = score;
                }
            });
        });
    }

    // Cek apakah ada kombinasi kata dan angka
    if (ada_kata_angka(teksAsli)) {
        return { status: 'judi', alasan: 'Terdeteksi pola kata+angka yang mencurigakan' };
    }

    // Jika skor fuzzy matching cukup tinggi, anggap itu sebagai "judi"
    if (bestMatch.score >= 70) {
        return {
            status: 'judi',
            alasan: `Terdeteksi kata "${bestMatch.kata}" (tingkat kemiripan: ${Math.round(bestMatch.score)}%)`
        };
    }

    return { status: 'non-judi', alasan: 'Tidak terdeteksi unsur judi' };
}

// Event listener untuk DOM yang sudah siap
document.addEventListener('DOMContentLoaded', function () {
    const detectButton = document.getElementById('detectButton');
    const teksInput = document.getElementById('teks');
    const hasilDiv = document.getElementById('hasil');

    // Menampilkan hasil deteksi
    detectButton.addEventListener('click', function () {
        const inputText = teksInput.value.trim();

        // Validasi input
        if (!inputText) {
            hasilDiv.innerHTML = '<span style="color: #ff6b35;">⚠️ Mohon masukkan teks untuk dianalisis</span>';
            hasilDiv.style.display = 'block';
            return;
        }

        const result = deteksiFuzzy(inputText);

        // Menentukan warna dan pesan berdasarkan hasil
        let resultColor, resultIcon;
        if (result.status === 'judi') {
            resultColor = '#e74c3c'; // Merah
            resultIcon = '⚠️';
        } else {
            resultColor = '#27ae60'; // Hijau
            resultIcon = '✅';
        }

        const resultText = result.status === 'judi' ?
            'Kalimat mengandung unsur judi' :
            'Kalimat aman';

        // Menampilkan hasil deteksi di bagian 'hasil'
        hasilDiv.innerHTML = `
            <div style="color: ${resultColor}; font-weight: bold; margin-bottom: 10px; font-size: 18px;">
                ${resultIcon} ${resultText}
            </div>
            <div style="color: #666; font-size: 14px;">
                ${result.alasan}
            </div>
        `;

        // Tampilkan hasil
        hasilDiv.style.display = 'block';
    });

    // Deteksi otomatis saat mengetik (optional)
    teksInput.addEventListener('input', function () {
        if (this.value.trim() === '') {
            hasilDiv.style.display = 'none';
        }
    });

    // Deteksi saat menekan Enter
    teksInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            detectButton.click();
        }
    });
});