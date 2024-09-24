(function ($) {
    if (!window.Joomla) {
        throw new Error('Joomla API was not properly initialised');
    }

    const API_URLS = {
        getFilmDetails: 'index.php?option=com_ajax&module=imdb&method=getFilmDetails&format=json',
        getFilmResults: 'index.php?option=com_ajax&module=imdb&method=getFilmResults&format=json'
    };

    const MOVIES_PER_PAGE = 12; // Set how many movies to show per page
    let currentMovies = [];
    let currentPage = 0;

    const formatRuntime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `Runtime ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const renderFilms = (films) => {
        const $fragment = $(document.createDocumentFragment());
        const $filmTemplate = $($('#film-card-template').html());

        films.forEach((film) => {
            const {
                '#TITLE': title = 'Unknown Title',
                '#YEAR': year = 'Unknown Year',
                '#IMG_POSTER': poster = 'https://via.placeholder.com/200x300?text=Poster+Image',
                '#IMDB_ID': imdbID,
                '#IMDB_URL': imdbUrl = '#'
            } = film;

            const $filmClone = $filmTemplate.clone();
            $filmClone.find('.film-title').text(title);
            $filmClone.find('.film-year').text(year);
            $filmClone.find('.film-poster').attr('src', poster);

            $filmClone.find('.card').on('click', function () {
                const $filmModal = $('#film-details-modal');
                const $preLoader = $filmModal.find('.loader-outer').show();

                // Populate initial modal data
                $filmModal.find('.film-title').text(title);
                $filmModal.find('.film-poster').attr('src', poster);
                $filmModal.find('.imdb-link').attr('href', imdbUrl);

                $filmModal.find('.modal-release').text('');
                $filmModal.find('.film-description').text('');
                $filmModal.find('.film-runtime').text('');

                // Open modal
                new Foundation.Reveal($filmModal).open();

                // Fetch film details via AJAX
                Joomla.request({
                    url: API_URLS.getFilmDetails,
                    method: 'POST',
                    data: JSON.stringify({ filmID: imdbID }),
                    onSuccess: (response) => {
                        const data = JSON.parse(response);

                        const releaseDay = String(data?.top?.releaseDate?.day ?? '').padStart(2, '0');
                        const releaseMonth = String(data?.top?.releaseDate?.month ?? '').padStart(2, '0');
                        const releaseYear = data?.top?.releaseDate?.year ?? '';
                        const releaseDate = releaseYear ? `${releaseDay}/${releaseMonth}/${releaseYear}` : '';

                        // Populate modal with dynamic content
                        $filmModal.find('.modal-release').text(releaseDate);
                        $filmModal.find('.film-description').text(data?.short?.description ?? '');
                        $filmModal.find('.film-runtime').text(data?.top?.runtime?.seconds ? formatRuntime(data.top.runtime.seconds) : '');

                        const $filmGenres = $filmModal.find(".film-genres").empty();
                        if (Array.isArray(data?.short?.genre)) {
                            data.short.genre.forEach((genre) => {
                                $filmGenres.append($('<span />', { class: 'button genre', text: genre }));
                            });
                        }

                        $preLoader.hide();
                    },
                    onError: () => {
                        $filmModal.find('.modal-release').text('');
                        $filmModal.find('.film-description').text('An error occurred while fetching the details.');
                        $filmModal.find('.film-runtime').text('');
                        $preLoader.hide();
                    }
                });
            });

            $fragment.append($filmClone);
        });

        // Append new content
        $('#search-results').append($fragment);
    };

    const displayMessage = (message, type = 'warning') => `
        <div class="callout cell auto ${type}">
            ${message}
        </div>
    `;

    const loadMoreFilms = () => {
        const startIndex = currentPage * MOVIES_PER_PAGE;
        const endIndex = startIndex + MOVIES_PER_PAGE;

        const filmsToShow = currentMovies.slice(startIndex, endIndex);
        renderFilms(filmsToShow);

        currentPage++;

        // Check if more films need to be loaded
        if (endIndex >= currentMovies.length) {
            $('#load-more-button').hide(); // Hide load more button if no more films
        }
    };

    $('#load-more-button').on('click', loadMoreFilms);

    $('#search-button').on('click', () => {
        const searchQuery = $('#filmsearch-input').val().trim();

        if (!searchQuery) {
            $('#search-results').html(displayMessage('Please enter a search term.', 'alert'));
            $('#load-more-button').hide(); // Hide load more button
            return;
        }

        $('#search-results').html(displayMessage(`Searching for "${searchQuery}"...`));

        Joomla.request({
            url: API_URLS.getFilmResults,
            method: 'POST',
            data: JSON.stringify({ filmsearch: searchQuery }),
            onSuccess: (response) => {
                const data = JSON.parse(response);
                if (data.description && Array.isArray(data.description)) {
                    currentMovies = data.description; // Store all movies
                    currentPage = 0;
                    $('#search-results').empty(); // Clear results
                    loadMoreFilms(); // Load first set of movies
                    $('#load-more-button').show(); // Show load more button if there are more movies
                } else {
                    $('#search-results').html(displayMessage(data.error, 'alert'));
                    $('#load-more-button').hide(); // Hide load more button
                }
            },
            onError: () => {
                $('#search-results').html(displayMessage('An error occurred while fetching the data.', 'alert'));
                $('#load-more-button').hide(); // Hide load more button
            }
        });
    });
})(jQuery);
