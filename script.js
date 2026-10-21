const kunciData = "libraryreg_anggota";

// Mengambil data anggota dari localStorage
function ambilData() {
  try {
    const data = JSON.parse(localStorage.getItem(kunciData) || "[]");
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

// Menyimpan data anggota ke localStorage
function simpanData(data) {
  localStorage.setItem(kunciData, JSON.stringify(data));
}

// Berpindah halaman
function halaman(namaHalaman) {
  document.querySelectorAll(".halaman").forEach(function (bagian) {
    bagian.classList.remove("aktif");
  });

  const tujuan = document.getElementById(namaHalaman);

  if (tujuan) {
    tujuan.classList.add("aktif");
  }

  if (namaHalaman === "anggota") {
    tampilkanAnggota();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

// Menampilkan pesan
function tampilkanPesan(teks, jenis) {
  const pesan = document.getElementById("pesan");
  pesan.textContent = teks;
  pesan.className = jenis;
}

// Mengosongkan pesan
function hapusPesan() {
  const pesan = document.getElementById("pesan");
  pesan.textContent = "";
  pesan.className = "";
}

// Menghindari karakter HTML ditampilkan sebagai kode
function aman(teks) {
  return String(teks ?? "").replace(/[&<>"']/g, function (karakter) {
    const pengganti = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return pengganti[karakter];
  });
}

// Menyimpan data ketika formulir dikirim
document.getElementById("formAnggota").addEventListener("submit", function (event) {
  event.preventDefault();
  hapusPesan();

  const id = document.getElementById("id").value;

  const anggota = {
    id: id || Date.now().toString(),
    nama: document.getElementById("nama").value.trim(),
    nim: document.getElementById("nim").value.trim(),
    prodi: document.getElementById("prodi").value.trim(),
    email: document.getElementById("email").value.trim().toLowerCase(),
    telepon: document.getElementById("telepon").value.trim(),
    alamat: document.getElementById("alamat").value.trim(),
    jenis: document.getElementById("jenis").value
  };

  let data = ambilData();

  // Memeriksa NIM/NIP agar tidak terdaftar dua kali
  const nimDuplikat = data.some(function (item) {
    return item.nim.toLowerCase() === anggota.nim.toLowerCase()
      && item.id !== id;
  });

  if (nimDuplikat) {
    tampilkanPesan("NIM/NIP tersebut sudah terdaftar.", "error");
    return;
  }

  // Memeriksa email agar tidak terdaftar dua kali
  const emailDuplikat = data.some(function (item) {
    return item.email.toLowerCase() === anggota.email
      && item.id !== id;
  });

  if (emailDuplikat) {
    tampilkanPesan("Email tersebut sudah digunakan anggota lain.", "error");
    return;
  }

  if (id) {
    // Memperbarui data anggota yang sudah ada
    data = data.map(function (item) {
      return item.id === id ? anggota : item;
    });

    tampilkanPesan("Data anggota berhasil diperbarui.", "sukses");
  } else {
    // Menambahkan anggota baru
    data.push(anggota);

    tampilkanPesan("Pendaftaran anggota berhasil disimpan.", "sukses");
  }

  simpanData(data);

  document.getElementById("formAnggota").reset();
  document.getElementById("id").value = "";
  document.getElementById("tombolSimpan").textContent = "Simpan Data";

  tampilkanAnggota();
});

// Mengembalikan formulir ke mode pendaftaran baru
document.getElementById("formAnggota").addEventListener("reset", function () {
  setTimeout(function () {
    document.getElementById("id").value = "";
    document.getElementById("tombolSimpan").textContent = "Simpan Data";
    hapusPesan();
  }, 0);
});

// Menampilkan data anggota ke tabel
function tampilkanAnggota() {
  const data = ambilData();
  const kataKunci = document.getElementById("cari").value
    .trim()
    .toLowerCase();

  const hasil = data.filter(function (anggota) {
    return (
      anggota.nama.toLowerCase().includes(kataKunci) ||
      anggota.nim.toLowerCase().includes(kataKunci) ||
      anggota.telepon.toLowerCase().includes(kataKunci) ||
      anggota.alamat.toLowerCase().includes(kataKunci)
    );
  });

  const tabel = document.getElementById("dataAnggota");
  const kosong = document.getElementById("kosong");

  tabel.innerHTML = "";

  if (hasil.length === 0) {
    kosong.textContent = data.length === 0
      ? "Belum ada anggota yang terdaftar."
      : "Data anggota yang dicari tidak ditemukan.";

    return;
  }

  kosong.textContent = "";

  hasil.forEach(function (anggota) {
    const baris = document.createElement("tr");

    baris.innerHTML = `
      <td>${aman(anggota.nama)}</td>
      <td>${aman(anggota.nim)}</td>
      <td>${aman(anggota.prodi)}</td>
      <td>${aman(anggota.email)}</td>
      <td>${aman(anggota.telepon)}</td>
      <td>${aman(anggota.alamat)}</td>
      <td>${aman(anggota.jenis)}</td>
      <td class="aksi">
        <button class="edit" onclick="editAnggota('${aman(anggota.id)}')">
          Edit
        </button>
        <button class="hapus" onclick="hapusAnggota('${aman(anggota.id)}')">
          Hapus
        </button>
      </td>
    `;

    tabel.appendChild(baris);
  });
}

// Pencarian diperbarui setiap kali pengguna mengetik
document.getElementById("cari").addEventListener("input", tampilkanAnggota);

// Mengisi formulir dengan data yang ingin diedit
function editAnggota(id) {
  const anggota = ambilData().find(function (item) {
    return item.id === id;
  });

  if (!anggota) {
    return;
  }

  document.getElementById("id").value = anggota.id;
  document.getElementById("nama").value = anggota.nama;
  document.getElementById("nim").value = anggota.nim;
  document.getElementById("prodi").value = anggota.prodi;
  document.getElementById("email").value = anggota.email;
  document.getElementById("telepon").value = anggota.telepon || "";
  document.getElementById("alamat").value = anggota.alamat || "";
  document.getElementById("jenis").value = anggota.jenis;

  document.getElementById("tombolSimpan").textContent = "Simpan Perubahan";

  halaman("daftar");
  tampilkanPesan("Mode edit aktif. Ubah data, lalu simpan kembali.", "sukses");
}

// Menghapus data anggota
function hapusAnggota(id) {
  const data = ambilData();
  const anggota = data.find(function (item) {
    return item.id === id;
  });

  if (!anggota) {
    return;
  }

  const yakin = confirm(
    "Apakah kamu yakin ingin menghapus data " + anggota.nama + "?"
  );

  if (!yakin) {
    return;
  }

  const dataBaru = data.filter(function (item) {
    return item.id !== id;
  });

  simpanData(dataBaru);
  tampilkanAnggota();
}

// Menampilkan data saat halaman pertama kali dibuka
tampilkanAnggota();