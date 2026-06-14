import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea.jsx";
import { Button } from "../ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { countryAndCodeMap } from "@/config";

function CommonForm({
  formControls,
  buttonText,
  formData,
  setFormData,
  onSubmit,
  isBtnDisabled,
}) {
  const [showPassword, setShowPassword] = useState(false);

  function renderInputsByComponentType(getControlItem) {
    let element = null;
    const value = formData[getControlItem.name] || "";

    switch (getControlItem.componentType) {
      case "input": {
        const isPasswordField = getControlItem.type === "password";
        element = (
          <div className="relative">
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              id={getControlItem.id}
              type={
                isPasswordField && showPassword ? "text" : getControlItem.type
              }
              value={value}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: event.target.value,
                })
              }
              className={isPasswordField ? "pr-11" : ""}
            />
            {isPasswordField ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            ) : null}
          </div>
        );
        break;
      }
      case "phone-with-country": {
        const countryCodeValueFromMap =
          formData[getControlItem.countryCodeName] || "";
        const phoneValueInput = formData[getControlItem.name] || "";
        element = (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-700 font-medium min-w-max">
              {countryCodeValueFromMap || "+"}
            </div>
            <Input
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              id={getControlItem.id}
              type="tel"
              value={phoneValueInput}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: event.target.value,
                })
              }
              className="flex-1"
            />
          </div>
        );
        break;
      }
      case "select":
        element = (
          <Select
            onValueChange={(value) => {
              const updatedFormData = {
                ...formData,
                [getControlItem.name]: value,
              };
              // Auto-set country code when country is selected
              if (
                getControlItem.name === "country" &&
                countryAndCodeMap[value]
              ) {
                updatedFormData.countryCode = countryAndCodeMap[value];
              }
              setFormData(updatedFormData);
            }}
            value={value}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;
      case "textarea":
        element = (
          <Textarea
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.id}
            value={value}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;
      default:
        element = (
          <Input
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            id={getControlItem.name}
            type={getControlItem.type}
          />
        );
        break;
    }
    return element;
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((controlItem) => (
          <div className="grid w-full gap-1.5 " key={controlItem.name}>
            <Label className="mb-1">{controlItem.label}</Label>
            {renderInputsByComponentType(controlItem)}
          </div>
        ))}
      </div>
      <Button disabled={isBtnDisabled} type="submit" className="mt-2 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;
