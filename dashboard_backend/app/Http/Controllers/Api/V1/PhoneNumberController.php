<?php

namespace App\Http\Controllers\Api\V1;

use App\Data\Api\V1\PhoneNumberData;
use App\Http\Resources\Api\V1\PhoneNumberResource;
use App\Models\PhoneNumber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * @authenticated
 * @group Phone Numbers
 */
class PhoneNumberController extends Controller
{
    /**
     * List all phone numbers
     *
     * @authenticated
     * @queryParam filter[did] string optional Filter by DID (partial match)
     * @queryParam filter[provider] string optional Filter by provider
     * @queryParam filter[country_code] string optional Filter by country code
     * @queryParam sort string optional Sort by field (did, country_code, created_at, updated_at)
     * @queryParam filter[agents] string optional Include agents in response
     * @response {"data": [{"id": 1, "did": "+1234567890", "provider": "twilio", "country_code": "US"}], "meta": {...}}
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $phoneNumbers = QueryBuilder::for(PhoneNumber::class)
            ->allowedFilters(
                AllowedFilter::partial('did'),
                AllowedFilter::exact('provider'),
                AllowedFilter::exact('country_code'),
            )
            ->allowedSorts(
                'did',
                'country_code',
                'created_at',
                'updated_at',
            )
            ->defaultSort('-created_at')
            ->allowedIncludes('agents')
            ->paginate();

        return PhoneNumberResource::collection($phoneNumbers);
    }

    /**
     * Create a new phone number
     *
     * @authenticated
     * @bodyParam did string required Phone number (DID)
     * @bodyParam provider string optional Provider name: voxsun | twilio
     * @bodyParam country_code string optional Country code
     * @bodyParam provider_config object required Provider-specific configuration settings
     * Example: {"account_sid": "AC123", "auth_token": "secret"}
     *  // Twilio example
     * @bodyParam provider_config.account_sid string required Twilio Account SID Example: AC123
     * @bodyParam provider_config.auth_token string required Twilio Auth Token Example: secret
     *
     * // Voxsun example
     * @bodyParam provider_config.username string required Voxsun SIP Trunk username Example: john_doe
     * @bodyParam provider_config.secret string required Voxsun SIP Trunk Secret Example: secret_456
     * @bodyParam provider_config.sip_domain string required Voxsun SIP Domain Example: sip.voxsun.com
     * 
     * @response {"id": 1, "did": "+1234567890", "provider": "twilio", "country_code": "US"}
     */
    public function store(PhoneNumberData $data): PhoneNumberResource
    {
        $phoneNumber = PhoneNumber::create($data->toArray());

        return new PhoneNumberResource($phoneNumber);
    }

    /**
     * Get a specific phone number
     *
     * @authenticated
     * @queryParam filter[agents] string optional Include agents in response
     * @response {"id": 1, "did": "+1234567890", "provider": "twilio", "country_code": "US", "agents": [...]}
     */
    public function show(Request $request, PhoneNumber $phoneNumber): PhoneNumberResource
    {
        $phoneNumber = QueryBuilder::for($phoneNumber)
            ->allowedIncludes('agents')
            ->first();

        return new PhoneNumberResource($phoneNumber);
    }

    /**
     * Update a phone number
     *
     * @authenticated
     * @bodyParam did string optional Phone number (DID)
     * @bodyParam country_code string optional Country code
     * @bodyParam provider_config object required Provider-specific configuration settings
     * Example: {"account_sid": "AC123", "auth_token": "secret"}
     *  // Twilio example
     * @bodyParam provider_config.account_sid string required Twilio Account SID Example: AC123
     * @bodyParam provider_config.auth_token string required Twilio Auth Token Example: secret
     *
     * // Voxsun example
     * @bodyParam provider_config.username string required Voxsun SIP Trunk username Example: john_doe
     * @bodyParam provider_config.secret string required Voxsun SIP Trunk Secret Example: secret_456
     * @bodyParam provider_config.sip_domain string required Voxsun SIP Domain Example: sip.voxsun.com
     * @response {"id": 1, "did": "+1234567890", "provider": "twilio", "country_code": "US"}
     */
    public function update(PhoneNumberData $data, PhoneNumber $phoneNumber): PhoneNumberResource
    {
        $phoneNumber->update($data->toArray());

        return new PhoneNumberResource($phoneNumber->fresh());
    }

    /**
     * Delete a phone number
     *
     * @authenticated
     * @response 204
     */
    public function destroy(PhoneNumber $phoneNumber): JsonResponse
    {
        $phoneNumber->delete();
        return response()->json(null, 204);
    }
}
