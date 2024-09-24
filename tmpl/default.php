<?php
defined('_JEXEC') or die;

$document = $this->app->getDocument();
$wa = $document->getWebAssetManager();
$wa->getRegistry()->addExtensionRegistryFile('mod_imdb');

// Load the Foundation CSS and custom styles
$wa->useStyle('mod_imdb.foundation-css');
$wa->useStyle('mod_imdb.module-style');

$wa->useScript('mod_imdb.films');

?>
<div class="mod-filmsearch">
    <!-- Search Form -->
    <form id="filmsearch-form" action="javascript:void(0);" method="post" onsubmit="return false;" class="grid-x">
        <div class="cell small-8">
            <label>Your search term
                <input type="text" id="filmsearch-input" placeholder="Search for films..." class="input-group-field">
            </label>
        </div>
        <div class="cell small-4 search-cell">
            <button type="button" id="search-button" class="button expanded success">Search Movies</button>
        </div>
    </form>

    <!-- Default State -->
    <div id="search-results" class="grid-x small-up-1 medium-up-3 large-up-6">
        <div class="callout warning cell auto">
            <p>Search for a movie title to get started</p>
        </div>
    </div>

    <!-- Load More Button -->
    <div class="grid-x">
        <button type="button" id="load-more-button" class="button expanded" style="display: none;">Load More</button>
    </div>

    <!-- Modal Structure -->
    <div id="film-details-modal" class="reveal" data-reveal>
        <div class="modal-content">
            <div class="loader-outer">
                <div class="film-loader"></div>
            </div>
            <button class="close-button" data-close aria-label="Close modal" type="button">
                <span aria-hidden="true">&times;</span>
            </button>
            <div class="film-details-header">
                <h3 class="film-title"></h3>
                <p class="film-release-date">Released <span class="modal-release"></span></p>
            </div>

            <div class="film-genres"></div>

            <div class="grid-x grid-margin-x">
                <div class="cell small-4">
                    <img class="film-poster" src="https://via.placeholder.com/200x300?text=Poster+Image" alt="Poster Image">
                </div>
                <div class="cell small-8">
                    <p class="film-description"></p>
                    <p class="film-runtime"></p>
                </div>
            </div>

            <a href="#" target="_blank" class="button imdb-link">Read more on IMDB</a>
        </div>
    </div>
</div>

<!-- Template for Film Card -->
<template id="film-card-template">
    <div class="cell">
        <div class="cellradius bordered shadow card">
            <div class="poster-outer">
                <img class="film-poster" alt="Poster Image">
            </div>
            <div class="card-section">
                <h4 class="film-title"></h4>
                <p class="film-year"></p>
            </div>
        </div>
    </div>
</template>