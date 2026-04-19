<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class CategoryController extends Controller
{
    public function __construct(private CategoryService $service) {}

    public function index(): ResourceCollection
    {
        return CategoryResource::collection(
            Category::with(['parent', 'children'])->orderBy('sort_order')->orderBy('name')->get()
        );
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->service->store($request->validated(), $request->user()->id);

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        return new CategoryResource($this->service->update($category, $request->validated()));
    }

    public function destroy(Category $category): Response
    {
        $this->service->destroy($category);

        return response()->noContent();
    }
}
