$(document).ready(function() {
    const apiUrl = "https://www.googleapis.com/books/v1/volumes?q=";
    const bookshelfApiUrl = "https://www.googleapis.com/books/v1/users/114730329718311628938/bookshelves/1001/volumes";
    let currentView = "grid";

    function searchBooks(term, page) {
        const startIndex = (page - 1) * 10;
        const searchUrl = `${apiUrl}${encodeURIComponent(term)}&startIndex=${startIndex}&maxResults=10`;

        $.getJSON(searchUrl, function(data) {
            renderBooks(data.items, '#search-results');
            showPagination(term, data.totalItems, page);
        }).fail(function() {
            alert("Error fetching data. Please try again later.");
        });
    }


    function renderBooks(books, containerId) {
        const template = $('#book-template').html();
        $(containerId).empty();

        if (books && books.length > 0) {
            books.forEach(book => {
                const bookData = {
                    id: book.id,
                    title: book.volumeInfo?.title || "No title available",
                    thumbnail: book.volumeInfo?.imageLinks?.thumbnail || "https://via.placeholder.com/128x192"
                };
                const html = Mustache.render(template, bookData);
                $(containerId).append(html);
            });
        } else {
            $(containerId).append("<p>No books found.</p>");
        }

        applyView();
    }

 
    function loadBookDetails(bookId) {
        const detailsUrl = `https://www.googleapis.com/books/v1/volumes/${bookId}`;

        $.get(detailsUrl, function(data) {
            const book = data.volumeInfo;
            const detailsData = {
                title: book.title,
                authors: book.authors ? book.authors.join(", ") : "Unknown author",
                description: book.description || "No description available",
                thumbnail: book.imageLinks ? book.imageLinks.thumbnail : "https://via.placeholder.com/128x192"
            };
            const detailsTemplate = $('#book-details-template').html();
            const html = Mustache.render(detailsTemplate, detailsData);
            $('#details-content').html(html);
        }).fail(function() {
            $('#details-content').html("<p>Error loading book details. Please try again later.</p>");
        });
    }

 
    function loadBookshelf() {
        $.getJSON(bookshelfApiUrl, function(data) {
            renderBooks(data.items, '#bookshelf-content');
        }).fail(function() {
            $('#bookshelf-content').html("<p>Error loading bookshelf. Please try again later.</p>");
        });
    }

    function showPagination(term, totalItems, currentPage) {
        $('#pagination').empty();
        const totalPages = Math.ceil(totalItems / 10);

        for (let i = 1; i <= totalPages && i <= 5; i++) {
            const pageButton = `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            $('#pagination').append(pageButton);
        }
    }

    function applyView() {
        if (currentView === "grid") {
            $('#search-results, #bookshelf-content').addClass('grid-view').removeClass('list-view');
        } else {
            $('#search-results, #bookshelf-content').addClass('list-view').removeClass('grid-view');
        }
    }


    $('#search-button').click(function() {
        const searchTerm = $('#search-term').val().trim();
        if (searchTerm) searchBooks(searchTerm, 1);
    });

    $('#pagination').on('click', 'button', function() {
        const page = $(this).data('page');
        const searchTerm = $('#search-term').val();
        searchBooks(searchTerm, page);
    });

    $('#search-results, #bookshelf-content').on('click', '.book-item', function() {
        const bookId = $(this).data('id');
        loadBookDetails(bookId);
    });

    $('#grid-view').click(function() {
        currentView = "grid";
        applyView();
    });

    $('#list-view').click(function() {
        currentView = "list";
        applyView();
    });

    loadBookshelf();
});
