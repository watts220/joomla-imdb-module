<?php

namespace Joomla\Module\Imdb\Site\Helper;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Http\HttpFactory;

class ImdbHelper
{
    private const API_BASE_URL = 'https://search.imdbot.workers.dev/';
    
    /**
     * Retrieves Film Details via AJAX
     */
    public static function getFilmDetailsAjax()
    {
        $filmID = self::getInputData('filmID');
        if (empty($filmID)) {
            self::sendErrorResponse(400, 'No search Film ID provided.');
        }

        // Build the API URL
        $apiUrl = self::API_BASE_URL . '?tt=' . urlencode($filmID);
        self::fetchApiData($apiUrl);
    }

    /**
     * Retrieves Film Results via AJAX
     */
    public static function getFilmResultsAjax()
    {
        $searchQuery = self::getInputData('filmsearch');
        if (empty($searchQuery)) {
            self::sendErrorResponse(400, 'No search query provided.');
        }

        // Build the API URL
        $apiUrl = self::API_BASE_URL . '?q=' . urlencode($searchQuery);
        self::fetchApiData($apiUrl);
    }

    /**
     * Fetches data from the API and handles response
     *
     * @param string $apiUrl The API URL to fetch data from
     */
    private static function fetchApiData(string $apiUrl)
    {
        try {
            $http = HttpFactory::getHttp();
            $response = $http->get($apiUrl);

            // Check if the response is successful
            if ($response->code == 200) {
                self::sendSuccessResponse($response->body);
            } else {
                self::sendErrorResponse($response->code, 'API call failed.');
            }
        } catch (\Exception $e) {
            self::sendErrorResponse(500, 'An error occurred: ' . $e->getMessage());
        }
    }

    /**
     * Get input data (JSON or default string fallback)
     *
     * @param string $key The input key to retrieve
     * @return mixed The input value or null if not found
     */
    private static function getInputData(string $key)
    {
        $inputData = Factory::getApplication()->input->json->getArray();
        return $inputData[$key] ?? Factory::getApplication()->input->getString($key, '');
    }

    /**
     * Sends a successful response as JSON and closes the application
     *
     * @param string $data The data to encode and send
     */
    private static function sendSuccessResponse(string $data)
    {
        echo json_encode(json_decode($data, true));
        Factory::getApplication()->close();
    }

    /**
     * Sends an error response as JSON and closes the application
     *
     * @param int $statusCode The HTTP status code
     * @param string $errorMessage The error message to include
     */
    private static function sendErrorResponse(int $statusCode, string $errorMessage)
    {
        echo json_encode([
            'status' => $statusCode,
            'error' => $errorMessage
        ]);
        Factory::getApplication()->close();
    }
}
