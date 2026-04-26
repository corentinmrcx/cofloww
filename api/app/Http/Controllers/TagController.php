<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTagRequest;
use App\Http\Requests\UpdateTagRequest;
use App\Http\Resources\TagResource;
use App\Models\Tag;
use App\Services\TagService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class TagController extends Controller
{
    public function __construct(private TagService $service) {}

    public function index(): ResourceCollection
    {
        return TagResource::collection(
            Tag::orderBy('name')->get()
        );
    }

    public function store(StoreTagRequest $request): JsonResponse
    {
        $tag = $this->service->store($request->validated(), $request->user()->id);

        return (new TagResource($tag))->response()->setStatusCode(201);
    }

    public function update(UpdateTagRequest $request, Tag $tag): TagResource
    {
        return new TagResource($this->service->update($tag, $request->validated()));
    }

    public function destroy(Tag $tag): Response
    {
        $this->service->destroy($tag);

        return response()->noContent();
    }
}
