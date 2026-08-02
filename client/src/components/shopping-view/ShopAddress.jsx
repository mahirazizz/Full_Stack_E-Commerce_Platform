import { useEffect, useState } from "react";
import CommonForm from "../common/form.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import AddressCard from "./ShopAddressCard";
import { useToast } from "../../hooks/useToast.js";
import {
  addNewAddress,
  deleteAddress,
  editAddress,
  fetchAllAddress,
} from "@/store/shop/address-slice/index.js";

const initialAddressFormData = {
  name: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
  countryCode: "",
  phone: "",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId }) {
  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { addressList } = useSelector((state) => state.shopAddress);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function handleManageAddress(event) {
    event.preventDefault();

    if (addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });

      return;
    }

    currentEditedId !== null
      ? dispatch(
          editAddress({
            userId: user?.id,
            addressId: currentEditedId,
            formData,
          }),
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddress(user?.id));
            setCurrentEditedId(null);
            setFormData(initialAddressFormData);
            toast({
              title: "Address updated successfully",
            });
          }
        })
      : dispatch(
          addNewAddress({
            ...formData,
            userId: user?.id,
          }),
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllAddress(user?.id));
            setFormData(initialAddressFormData);
            toast({
              title: "Address added successfully",
            });
          }
        });
  }

  function handleDeleteAddress(getCurrentAddress) {
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id }),
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddress(user?.id));
        toast({
          title: "Address deleted successfully",
        });
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    setCurrentEditedId(getCuurentAddress?._id);
    setFormData({
      ...formData,
      name: getCuurentAddress?.name,
      addressLine1: getCuurentAddress?.addressLine1,
      addressLine2: getCuurentAddress?.addressLine2,
      city: getCuurentAddress?.city,
      state: getCuurentAddress?.state,
      pincode: getCuurentAddress?.pincode,
      country: getCuurentAddress?.country,
      countryCode: getCuurentAddress?.countryCode,
      phone: getCuurentAddress?.phone,
      notes: getCuurentAddress?.notes,
    });
  }

  function isFormValid() {
    const requiredFields = [
      "name",
      "addressLine1",
      "city",
      "state",
      "pincode",
      "country",
      "countryCode",
      "phone",
    ];
    return requiredFields.every(
      (field) => formData[field] && formData[field].trim() !== "",
    );
  }

  useEffect(() => {
    dispatch(fetchAllAddress(user?.id));
  }, [dispatch, user?.id]);

  return (
    <Card className="gap-0 overflow-hidden rounded-3xl border-slate-200 bg-white py-0 shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
      <CardHeader className="space-y-3 border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
              Saved Addresses
            </CardTitle>
            <p className="text-sm text-slate-500">
              Select one address for checkout, or update an existing one.
            </p>
          </div>
          <div className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
            {addressList?.length || 0} saved
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {addressList && addressList.length > 0 ? (
            addressList.map((singleAddressItem, index) => (
              <AddressCard
                key={singleAddressItem?._id}
                addressIndex={index}
                selectedId={selectedId}
                handleDeleteAddress={handleDeleteAddress}
                addressInfo={singleAddressItem}
                handleEditAddress={handleEditAddress}
                setCurrentSelectedAddress={setCurrentSelectedAddress}
              />
            ))
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center lg:col-span-2 xl:col-span-3">
              <p className="text-lg font-semibold text-slate-900">
                No saved address yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first address below to continue checkout.
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardHeader className="border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:px-6">
        <CardTitle className="text-lg font-black tracking-tight text-slate-950">
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-4 py-5 sm:px-6">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Edit" : "Add"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
}

export default Address;
