import ProductImageUpload from "@/components/admin-view/AdminImageUpload";
import AdminProductTile from "@/components/admin-view/AdminProductTile";
import CommonForm from "@/components/common/Form.jsx";
import { addProductFormElements, brandsByCategory } from "@/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice/index.js";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useDispatch, useSelector } from "react-redux";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/useToast.js";

const initialFormData = {
  image: null,
  images: [],
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: 0,
  totalStock: "",
};

function AdminProducts() {
  const [openCreateProductDialog, setOpenCreateProductDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const { productList } = useSelector((state) => state.adminProducts);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const productCount = productList?.length || 0;

  // Generate form controls with dynamically filtered brands based on selected category
  const dynamicFormControls = useMemo(() => {
    return addProductFormElements.map((control) => {
      if (control.name === "brand") {
        const selectedCategory = formData.category;
        const brandOptions =
          selectedCategory && brandsByCategory[selectedCategory]
            ? brandsByCategory[selectedCategory]
            : [];
        return { ...control, options: brandOptions };
      }
      return control;
    });
  }, [formData.category]);

  function onSubmit(event) {
    event.preventDefault();

    currentEditedId !== null
      ? dispatch(
          editProduct({
            id: currentEditedId,
            formData: {
              ...formData,
              image: formData.image || formData.images?.[0] || null,
            },
          }),
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllProducts());
            setFormData(initialFormData);
            setOpenCreateProductDialog(false);
            setCurrentEditedId(null);
            setImageFile(null);
            setUploadedImages([]);
          }
        })
      : dispatch(
          addNewProduct({
            ...formData,
            image: formData.image || uploadedImages[0] || null,
            images: uploadedImages,
          }),
        ).then((data) => {
          if (data?.payload?.success) {
            setOpenCreateProductDialog(false);
            setImageFile(null);
            setUploadedImages([]);
            setFormData(initialFormData);
            toast({
              title: "Product added successfully",
            });
          }
        });
  }
  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
      }
    });
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  return (
    <Fragment>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Inventory
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-950">
            Products
          </h1>
          <p className="max-w-2xl text-sm text-slate-600">
            Add, edit, and manage the store catalog from a cleaner, faster
            workspace.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[22rem]">
          <Card className="border-white/70 bg-white/80">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Total products
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {productCount}
              </p>
            </CardContent>
          </Card>
          <Button
            onClick={() => setOpenCreateProductDialog(true)}
            className="h-full rounded-2xl bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800"
          >
            Add product
          </Button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {productList && productList.length > 0
          ? productList.map((productItem) => (
              <AdminProductTile
                key={productItem._id}
                setOpenCreateProductDialog={setOpenCreateProductDialog}
                setFormData={setFormData}
                setCurrentEditedId={setCurrentEditedId}
                setImageFile={setImageFile}
                setUploadedImages={setUploadedImages}
                product={productItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductDialog}
        onOpenChange={(open) => {
          setOpenCreateProductDialog(open);
          if (!open) {
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setImageFile(null);
            setUploadedImages([]);
          }
        }}
      >
        <SheetContent
          side="right"
          className="overflow-auto border-l-0 bg-slate-50 p-4 sm:w-[28rem] sm:max-w-[28rem]"
        >
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edited Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImages={uploadedImages}
            setUploadedImages={setUploadedImages}
            imageLoadingState={imageLoadingState}
            setImageLoadingState={setImageLoadingState}
            isEditMode={currentEditedId !== null}
            formData={formData}
            setFormData={setFormData}
          />
          <div className="py-6">
            <CommonForm
              formControls={dynamicFormControls}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              onSubmit={onSubmit}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
