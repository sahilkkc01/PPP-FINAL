function pagi_search(search, tbl, pagiDiv) {
  const rowsPerPage = 10;
  let currentPage = 1;
  let filteredRows = [];

  function filterTable() {
    const searchTerm = $(search).val().toLowerCase();
    const rows = $(`${tbl} tbody tr`);

    filteredRows = rows.filter(function () {
      const rowText = $(this).text().toLowerCase();
      return rowText.includes(searchTerm);
    });

    currentPage = 1;
    paginateTable();
  }

  function paginateTable() {
    const totalRows = filteredRows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    // Hide all rows first
    $(`${tbl} tbody tr`).hide();

    // Show only rows for current page
    filteredRows
      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      .show();

    // Generate pagination buttons
    let paginationButtons = `
                <button class="page-btn prev-btn ${
                  currentPage === 1 ? "disabled" : ""
                }">&laquo;</button>
            `;

    // Intelligent page button rendering
    const maxVisibleButtons = 5;
    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (startPage > 1) {
      paginationButtons += `<button class="page-btn" data-page="1">1</button>
                                       <span class="ellipsis">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
      paginationButtons += `
                    <button class="page-btn ${
                      i === currentPage ? "active" : ""
                    }" data-page="${i}">
                        ${i}
                    </button>
                `;
    }

    if (endPage < totalPages) {
      paginationButtons += `
                    <span class="ellipsis">...</span>
                    <button class="page-btn" data-page="${totalPages}">${totalPages}</button>
                `;
    }

    paginationButtons += `
                <button class="page-btn next-btn ${
                  currentPage === totalPages ? "disabled" : ""
                }">&raquo;</button>
            `;

    $(pagiDiv).html(paginationButtons);

    // Pagination button click handlers
    $(pagiDiv)
      .find(".page-btn:not(.disabled)")
      .on("click", function () {
        if ($(this).hasClass("prev-btn")) {
          currentPage = Math.max(1, currentPage - 1);
        } else if ($(this).hasClass("next-btn")) {
          currentPage = Math.min(totalPages, currentPage + 1);
        } else {
          currentPage = parseInt($(this).data("page"));
        }
        paginateTable();
      });
  }

  // Initial setup
  $(search).on("keyup", filterTable);

  // Initial filter and paginate
  filterTable();
  paginateTable();
}
