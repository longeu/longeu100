import { yupResolver } from "@hookform/resolvers/yup";
import baseApi from "api/baseApi";
import { customerType } from "interfaces/customerType.interface";
import { initialCustomer, optionSelectGender } from "pages/Customer/Initial";
import { schema } from "pages/Customer/Validate";
import React, {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useState,
} from "react";
import DatePicker from "react-date-picker";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import Select from "react-select";
import { addCustomer } from "reducers/orderSlice";
import { setShow } from "reducers/toastSlice";

export function AddUpdateForm(props: any) {
  const history = useHistory();
  const [customer, setCustomer] = useState(props.customer);
  const dispatch = useDispatch();
  const handleChangeGender = (val: any) => {
    console.log(val);
    setCustomer({
      ...customer,
      gender: val?.value,
    });
  };
  const handleChangeDate = (date: Date) => {
    setCustomer({
      ...customer,
      birth: date,
    });
  };
  useEffect(() => {
    const getCustomer = async () => {
      setCustomer(props.customer);
      if (customer.address) {
        setAddress(JSON.parse(customer.address));
        await getDistricts(JSON.parse(customer.address).province);
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${
            JSON.parse(customer.address).province.value
          }?depth=3`
        );

        const provinces = await response.json();
        await provinces.districts.forEach((item: any) => {
          if (item.code === JSON.parse(customer.address).district.value) {
            let newWards: any = [];
            item.wards.forEach((ward: any) => {
              newWards.push({
                ...ward,
                value: ward.code,

                label: ward.name,
              });
            });
            setWards(newWards);
          }
        });
      }
    };
    getCustomer();
  }, []);

  const onSubmit = async (data: customerType) => {
    try {
      const customerData: customerType = {
        ...customer,
        address: address.province.value !== 0 ? JSON.stringify(address) : null,
      };
      console.log(customerData);
      if (customerData.id) {
        const response = await baseApi.put("customers", customerData);
        if (props.updateCustomerOrder) {
          const action = addCustomer({
            customer: response.data,
            index: props.activeOrder,
          });
          dispatch(action);
        }
        props.onHide();
      } else {
        await baseApi.post("customers", customerData);
        if (props.updateCustomerOrder) {
          props.onHide();
        } else {
          history.push("/customer/list");
        }
      }
      const action = setShow({
        show: true,
        content: "???? l??u th??ng tin kh??ch h??ng",
        type: "success",
      });

      dispatch(action);
    } catch (error) {
      console.log(error);
    }
  };
  const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer({
      ...customer,
      [name]: value,
    });
  };

  const [address, setAddress] = React.useState({
    province: {
      value: 0,
      label: "Ch???n t???nh/th??nh ph???",
    },
    district: {
      value: 0,
      label: "Ch???n qu???n/huy???n",
    },
    ward: {
      value: 0,
      label: "Ch???n ph?????ng/x??",
    },
  } as any);
  const [districts, setDistricts] = React.useState([] as any);
  const [provinces, setProvinces] = React.useState([] as any);
  const [wards, setWards] = React.useState([] as any);
  useEffect(() => {
    const getAddress = async () => {
      try {
        await getProvinces();
      } catch (err) {
        console.log(err);
      }
    };
    getAddress();
  }, []);
  const getProvinces = async () => {
    try {
      const response = await fetch(
        ` https://provinces.open-api.vn/api/?depth=3`
      );
      const data = await response.json();
      let newProvinces: any = [];
      data.forEach((element: any) => {
        newProvinces.push({
          ...element,
          value: element.code,
          label: element.name,
        });
      });
      setProvinces(newProvinces);
    } catch (err) {
      console.log(err);
    }
  };
  const getDistricts = async (provinceCode: any) => {
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/p/${provinceCode.value}?depth=3`
      );
      const data = await response.json();

      let newDistricts: any = [];
      data.districts.forEach((element: any) => {
        newDistricts.push({
          ...element,
          value: element.code,
          label: element.name,
        });
      });
      setDistricts(newDistricts);
    } catch (err) {
      console.log(err);
    }
  };
  const getWards = async (districtCode: any) => {
    await districts.forEach((element: any) => {
      if (element.value === districtCode.value) {
        let newWards: any = [];
        element.wards.forEach((ward: any) => {
          newWards.push({
            ...ward,
            value: ward.code,
            label: ward.name,
          });
        });
        setWards(newWards);
      }
    });
  };
  const checkUnique = async (name: string, value: string) => {
    if (name === "email" && value) {
      try {
        const response = await baseApi.get("customers/email", {
          email: value,
          id: customer.id || 0,
        });
        if (response.data) {
          setError("email", {
            type: "required",
            message: "Email n??y ???? t???n t???i !",
          });
          setCustomer({
            ...customer,
            email: "",
          });
        } else {
          clearErrors(["email"]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (name === "phone" && value) {
      try {
        const response = await baseApi.get("customers/phone", {
          phone: value,
          id: customer.id || 0,
        });
        if (response.data) {
          setError("phone", {
            type: "required",
            message: "S??? ??i???n tho???i n??y ???? t???n t???i !",
          });
          setCustomer({
            ...customer,
            phone: "",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const {
    register,
    setValue,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors },
  } = useForm<customerType>({
    reValidateMode: "onBlur",
    resolver: yupResolver(schema),
    shouldFocusError: false,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="customer-form">
      <div className="card-body" style={{ padding: 15 }}>
        <div className="form-group"></div>
        <div className="form-group">
          <div className="row">
            <div className="col-6">
              <label htmlFor="phone">
                H??? V?? T??n<span className="ml-1 text-danger">*</span>
              </label>

              <input
                type="text"
                onFocus={() => clearErrors(["name"])}
                {...register("name", {
                  value: customer.name,
                  onChange: inputChange,
                })}
                className={
                  errors.name ? "form-control is-invalid" : "form-control  "
                }
                {...setValue("name", customer.name)}
                placeholder="T??n"
              />
              <p style={{ color: "red" }}>{errors.name?.message}</p>
            </div>
            <div className="col-6">
              <label htmlFor="phone">
                S??? ??i???n tho???i<span className="ml-1 text-danger">*</span>
              </label>

              <input
                type="text"
                onFocus={() => clearErrors(["phone"])}
                {...setValue("phone", customer.phone)}
                {...register("phone", {
                  value: customer.phone,
                  onChange: inputChange,
                  onBlur: (e) => checkUnique("phone", e.target.value),
                })}
                className={
                  errors.phone ? "form-control is-invalid" : "form-control  "
                }
                placeholder="S??? ??i???n Tho???i"
              />
              <p style={{ color: "red" }}>{errors.phone?.message}</p>
            </div>
            <div className="form-group">
              <label htmlFor="address">
                Email<span className="ml-1 text-danger">*</span>
              </label>

              <input
                type="text"
                onFocus={() => clearErrors(["email"])}
                {...register("email", {
                  value: customer.email,
                  onChange: inputChange,
                  onBlur: (e) => checkUnique("email", e.target.value),
                })}
                className={
                  errors.email ? "form-control is-invalid" : "form-control  "
                }
                {...setValue("email", customer.email)}
                placeholder="abc@gmail.com"
              />

              <p style={{ color: "red" }}>{errors.email?.message}</p>
            </div>
          </div>
          <div className="form-group">
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="">T???nh/Th??nh Ph???</label>
                <Select
                  options={provinces}
                  value={address.province}
                  defaultValue={address.province}
                  placeholder="Ch???n t???nh th??nh"
                  onChange={(e: any) => {
                    console.log(e.label);

                    setAddress({
                      province: {
                        value: e.value,
                        label: e.label,
                      },
                      district: {
                        value: 0,
                        label: "Ch???n qu???n/huy???n",
                      },
                      ward: {
                        value: 0,
                        label: "Ch???n ph?????ng/x??",
                      },
                    });
                    getDistricts(e);
                  }}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="">Qu???n/Huy???n</label>
                <Select
                  options={districts}
                  value={address.district}
                  defaultValue={address.district}
                  placeholder="Ch???n qu???n huy???n"
                  onChange={(e: any) => {
                    setAddress({
                      ...address,
                      district: {
                        value: e.value,
                        label: e.label,
                      },
                      ward: {
                        value: 0,
                        label: "Ch???n ph?????ng/x??",
                      },
                    });
                    getWards(e);
                  }}
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="">Ph?????ng/X??</label>
                <Select
                  options={wards}
                  value={address.ward}
                  defaultValue={address.ward}
                  placeholder="Ch???n ph?????ng x??"
                  onChange={(e: any) => {
                    setAddress({
                      ...address,
                      ward: {
                        value: e.value,
                        label: e.label,
                      },
                    });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="address">
              ?????a ch???<span className="ml-1 text-danger">*</span>
            </label>

            <input
              type="text"
              onFocus={() => clearErrors(["addressDetail"])}
              {...setValue("addressDetail", customer.addressDetail)}
              {...register("addressDetail", {
                value: customer.addressDetail,
                onChange: inputChange,
              })}
              className={
                errors.addressDetail
                  ? "form-control is-invalid"
                  : "form-control  "
              }
              placeholder="?????a ch???"
            />
            <p style={{ color: "red" }}>{errors.addressDetail?.message}</p>
          </div>

          <div className="form-group">
            <div className="row">
              <div className="col-6">
                <label htmlFor="birth">Ng??y sinh</label>
                <DatePicker
                  maxDate={new Date()}
                  {...register("birth")}
                  format="dd/MM/yyyy"
                  className="form-control"
                  activeStartDate={customer.birth}
                  value={customer.birth}
                  onChange={handleChangeDate}
                />
              </div>
              <div className="col-6">
                <label htmlFor="gender">Gi???i t??nh</label>
                <Select
                  {...register("gender")}
                  options={optionSelectGender}
                  value={
                    customer.gender
                      ? { value: 1, label: "Nam" }
                      : { value: 0, label: "N???" }
                  }
                  onChange={handleChangeGender}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
