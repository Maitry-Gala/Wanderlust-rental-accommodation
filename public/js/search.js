<script>
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const input = document.querySelector(".search-inp");

    form.addEventListener("submit", function (e) {
      e.preventDefault(); 
      const searchValue = input.value.trim();
    });
  });
</script>


