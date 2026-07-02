import { ErrorMessage, Field, Form, Formik } from "formik";
import { toast } from "react-hot-toast";
import { Button } from "src/components/common/Button";
import { Input } from "src/components/common/Input";
import { supabase } from "src/lib/supabase";

export interface DeliveryAddress {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface DeliveryAddressValues {
  full_name: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface DeliveryAddressFormProps {
  userId: string;
  onAddressSaved: (address: DeliveryAddress) => void;
  initialAddress?: DeliveryAddress | null;
  onCancelEdit?: () => void;
}

const getInitialValues = (
  address?: DeliveryAddress | null,
): DeliveryAddressValues => ({
  full_name: address?.full_name ?? "",
  phone: address?.phone ?? "",
  address: address?.address ?? "",
  landmark: address?.landmark ?? "",
  city: address?.city ?? "",
  state: address?.state ?? "",
  pincode: address?.pincode ?? "",
  is_default: address?.is_default ?? true,
});

const errorClass = "mt-1 text-sm text-red-400";
const labelClass = "mb-1 block text-sm font-medium text-zinc-300";
const textareaClass =
  "min-h-24 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-lime-400 focus:outline-none";

const validateAddress = (values: DeliveryAddressValues) => {
  const errors: Partial<Record<keyof DeliveryAddressValues, string>> = {};

  if (!values.full_name.trim()) {
    errors.full_name = "Full name is required";
  }

  if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Enter a 10 digit phone number";
  }

  if (!values.address.trim()) {
    errors.address = "Address is required";
  }

  if (!values.city.trim()) {
    errors.city = "City is required";
  }

  if (!values.state.trim()) {
    errors.state = "State is required";
  }

  if (!/^\d{6}$/.test(values.pincode.trim())) {
    errors.pincode = "Enter a 6 digit pincode";
  }

  return errors;
};

export const DeliveryAddressForm = ({
  userId,
  onAddressSaved,
  initialAddress,
  onCancelEdit,
}: DeliveryAddressFormProps) => {
  const handleSubmit = async (values: DeliveryAddressValues) => {
    if (!supabase) {
      toast.error("Something went wrong..");
      return;
    }

    const payload = {
      user_id: userId,
      full_name: values.full_name.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      landmark: values.landmark.trim() || null,
      city: values.city.trim(),
      state: values.state.trim(),
      pincode: values.pincode.trim(),
      is_default: values.is_default,
    };

    // const { data, error } = await supabase
let data: DeliveryAddress | null = null;
let error = null;

if (initialAddress) {
  const response = await supabase
    .from("addresses")
    .update(payload)
    .eq("id", initialAddress.id)
    .select("*")
    .single();

  data = response.data as DeliveryAddress | null;
  error = response.error;
} else {
  const response = await supabase
    .from("addresses")
    .insert(payload)
    .select("*")
    .single();

  data = response.data as DeliveryAddress | null;
  error = response.error;
}

if (error) {
  toast.error(error.message);
  return;
}

if (!data) {
  toast.error("Unable to save address.");
  return;
}

toast.success(
  initialAddress
    ? "Address updated successfully."
    : "Address saved successfully.",
);

onAddressSaved(data);
  };
  return (
    <article className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="text-xl font-semibold text-white">
  {initialAddress ? "Edit Address" : "Delivery Address"}
</h2>
      <p className="mt-1 text-sm text-zinc-400">
        {initialAddress
  ? "Update your delivery address."
  : "Add the address where you want this order delivered."}
      </p>

      <Formik
         enableReinitialize
  initialValues={getInitialValues(initialAddress)}
        validate={validateAddress}
        onSubmit={handleSubmit}
      >
       {({ isSubmitting, dirty }) => (
          <Form className="mt-6 space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="full_name" className={labelClass}>
                  Full Name
                </label>
                <Field
                  as={Input}
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
                  placeholder="Enter full name"
                />
                <ErrorMessage
                  name="full_name"
                  component="p"
                  className={errorClass}
                />
              </div>

              <div>
                <label htmlFor="phone" className={labelClass}>
                  Phone
                </label>
                <Field
                  as={Input}
                  id="phone"
                  name="phone"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10 digit phone number"
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className={errorClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className={labelClass}>
                Address
              </label>
              <Field
                as="textarea"
                id="address"
                name="address"
                rows={4}
                autoComplete="street-address"
                placeholder="House number, building, street, area"
                className={textareaClass}
              />
              <ErrorMessage
                name="address"
                component="p"
                className={errorClass}
              />
            </div>

            <div>
              <label htmlFor="landmark" className={labelClass}>
                Landmark
              </label>
              <Field
                as={Input}
                id="landmark"
                name="landmark"
                placeholder="Nearby landmark"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="city" className={labelClass}>
                  City
                </label>
                <Field
                  as={Input}
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  placeholder="City"
                />
                <ErrorMessage
                  name="city"
                  component="p"
                  className={errorClass}
                />
              </div>

              <div>
                <label htmlFor="state" className={labelClass}>
                  State
                </label>
                <Field
                  as={Input}
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  placeholder="State"
                />
                <ErrorMessage
                  name="state"
                  component="p"
                  className={errorClass}
                />
              </div>

              <div>
                <label htmlFor="pincode" className={labelClass}>
                  Pincode
                </label>
                <Field
                  as={Input}
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Pincode"
                />
                <ErrorMessage
                  name="pincode"
                  component="p"
                  className={errorClass}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3 text-sm text-zinc-300">
              <Field
                type="checkbox"
                name="is_default"
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-lime-400 focus:ring-lime-400"
              />
              Save as default address
            </label>

           <Button
  type="submit"
  className="w-full"
  size="lg"
  disabled={
    isSubmitting ||
    (Boolean(initialAddress) && !dirty)
  }
>
  {isSubmitting
    ? initialAddress
      ? "Updating..."
      : "Saving..."
    : initialAddress
      ? "Update Address"
      : "Save Address"}
</Button>

{initialAddress && (
  <Button
    type="button"
    variant="ghost"
    className="mt-3 w-full"
    onClick={onCancelEdit}
  >
    Cancel
  </Button>
)}
          </Form>
        )}
      </Formik>
    </article>
  );
};