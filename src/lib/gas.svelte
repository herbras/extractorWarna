<script lang="ts">
  import { historyStore } from "./store";
  let storageSubscription;
  let imageURL: string = "";
  let warna_dominan: string[] = [];

  function isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
  }

  async function fetchColors() {
    if (!isValidHttpUrl(imageURL)) {
      alert("Input harus berupa URL valid.");
      return;
    }
    const response = await fetch("https://warna.qlm.one/extract_colors/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image_url: imageURL }),
    });

    const result = await response.json();
    warna_dominan = result.warna_dominan;

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString(
      "default",
      { month: "short" },
    )}`;

    historyStore.update((store) => {
      store.push({ imageURL, warna_dominan, tanggal: formattedDate });
      return store;
    });
  }
  import { onDestroy } from "svelte";

  onDestroy(() => {
    window.removeEventListener("storage", storageSubscription);
  });

  function deleteHistory(index) {
    historyStore.update((store) => {
      store.splice(index, 1);
      return store;
    });
  }

  function copyToClipboard(color) {
    navigator.clipboard.writeText(color);
  }
  function goToWebsiteWithParams(colors) {
    if (colors && colors.length > 0) {
      const encodedColors = encodeURIComponent(JSON.stringify(colors));
      window.location.href = `http://localhost:4321/?colors=${encodedColors}`;
    } else {
      alert("Tidak ada warna untuk dikirimkan. Fetch warna terlebih dahulu.");
    }
  }

  const handleStorage = (event) => {
    if (event.key === "histories") {
      historyStore.set(JSON.parse(event.newValue));
    }
  };
</script>

<svelte:window on:storage={handleStorage} />
<div class="container mt-48 w-fit mx-auto p-4">
  <div class="mb-4">
    <input
      type="text"
      bind:value={imageURL}
      placeholder="URL Gambar"
      class="p-2 border rounded"
    />
    <button
      on:click={fetchColors}
      class="p-2 bg-blue-500 text-white rounded ml-2">Ambil Warna</button
    >
  </div>
  {#if imageURL}
    <div class="square-container bg-cover bg-center rounded-lg p-6 max-w-md">
      <img
        src={imageURL}
        alt="Gambar"
        class="object-cover w-full h-full rounded-lg"
      />
    </div>
  {/if}
</div>
<section class="mx-auto w-fit px-12">
  <!-- Bagian Histori -->
  <div
    class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6 lg:mb-16"
  >
    <!-- Mengulang setiap elemen dalam riwayat -->
    {#each $historyStore as history, index}
      <div
        class="rounded-lg shadow-lg mt-5 md:mt-12 bg-white dark:bg-gray-900 p-6 relative transition duration-200 ease-in-out transform hover:scale-105"
      >
        <!-- Tanggal dan bulan -->
        <div
          class="absolute z-50 top-0 right-0 p-2 text-sm text-gray-700 bg-opacity-50 bg-white dark:text-gray-300 dark:bg-gray-800 rounded-bl-md"
        >
          {history.tanggal}
        </div>

        <!-- Gambar -->
        <div
          class="square-container bg-cover bg-center rounded-lg overflow-hidden"
        >
          <img
            src={history.imageURL}
            alt="Gambar"
            class="object-cover w-full h-full rounded-lg"
          />
        </div>

        <!-- Lingkaran Warna -->
        <div class="flex flex-wrap mt-4">
          {#each history.warna_dominan as color}
            <div
              class="w-12 h-12 rounded-full mr-2 mb-2 cursor-pointer group relative transition duration-300 ease-in-out transform hover:scale-110"
              style="background-color: {color};"
              role="button"
              tabindex="0"
              on:click={() => copyToClipboard(color)}
              on:keydown={(e) => e.key === "Enter" && copyToClipboard(color)}
            >
              <i
                class="i-tabler-copy absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out"
              />
            </div>
          {/each}
        </div>
        <button
          on:click={() => goToWebsiteWithParams(history.warna_dominan)}
          class="p-2 bg-green-500 text-white rounded ml-2">Go Template</button
        >

        <!-- Tombol Hapus -->
        <button
          class="absolute bottom-0 right-0 p-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition duration-300 ease-in-out"
          on:click={() => deleteHistory(index)}>Hapus</button
        >
      </div>
    {/each}
  </div>
</section>
