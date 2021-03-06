import { getDownloadURL, ref, uploadBytesResumable } from "@firebase/storage";
import { yupResolver } from "@hookform/resolvers/yup";
import baseApi from "api/baseApi";
import { RootState } from "app/store";
import placeholder from "assets/dist/img/placeholder.png";
import { storage } from "components/Firebase/firebase";
import { staffType } from "interfaces/statffType.interface";
import Progress from "pages/Product/components/Progress";
import {
  schemaValidate,
  schemaValidateUpdate,
} from "pages/Staff/Components/Validate/Index";
import {
  initialStaff,
  optionRole,
  optionSelectStatus,
  optionsGender,
} from "pages/Staff/Initial";
import React, { ChangeEvent, useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import Select, { components } from "react-select";
import { setShow } from "reducers/toastSlice";
import { optionType } from "types";
const MultiValueRemove = (props: any) => {
  if (props.selectProps.value.length < 2) {
    return null;
  }
  return <components.MultiValueRemove {...props} />;
};

export function AddUpdateForm(props: any) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [staff, setStaff] = useState<staffType>(initialStaff);
  const { user } = useSelector((state: RootState) => state.currentUser);
  const [errorImage, setErrorImage] = useState("");
  const [progress, setProgress] = useState(0);
  const [isShowProgress, setIsShowProgress] = useState<boolean>(false);

  useEffect(() => {
    const getStaff = async () => {
      setStaff(props.staff);
      if (staff.address) {
        setAddress(JSON.parse(staff.address));
        await getDistricts(JSON.parse(staff.address).province);
        const response = await fetch(
          `https://provinces.open-api.vn/api/p/${
            JSON.parse(staff.address).province.value
          }?depth=3`
        );

        const provinces = await response.json();
        await provinces.districts.forEach((item: any) => {
          if (item.code === JSON.parse(staff.address).district.value) {
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
    getStaff();
  }, [props.staff]);
  const inputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setStaff({
      ...staff,
      [name]: value,
    });
  };
  const checkUnique = async (name: string, value: string) => {
    if (name === "username" && value) {
      try {
        const response = await baseApi.get("accounts/username", {
          username: value,
        });
        if (response.data) {
          setError("username", {
            type: "required",
            message: "T??i kho???n n??y ???? t???n t???i !",
          });
          setValue("username", "");
        } else {
          clearErrors(["username"]);
        }
      } catch (error) {
        console.log(error);
      }
    }
    if (name === "phone" && value) {
      try {
        const response = await baseApi.get("accounts/phone", {
          phone: value,
          id: staff.id || 0,
        });
        if (response.data) {
          setError("phone", {
            type: "required",
            message: "S??? ??i???n tho???i n??y ???? t???n t???i !",
          });
          setValue("phone", "");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleChangeGender = (val: any) => {
    setStaff({
      ...staff,
      gender: val?.value,
    });
  };
  const handleChangeStatus = (val: any) => {
    setStaff({
      ...staff,
      status: val?.value,
    });
  };
  const handleChangeRole = (e: any) => {
    setStaff({
      ...staff,
      roles: Array.isArray(e) ? e.map((x) => x.value) : [],
    });
  };
  const handleChangeDate = (date: Date) => {
    setStaff({
      ...staff,
      birth: date,
    });
  };
  const handleChoseFile = (e: any) => {
    let value = e.target.files[0];
    uploadFiles(value);
  };
  const uploadFiles = (file: any): any => {
    if (!file) return;
    if (!["image/jpg", "image/jpeg", "image/png"].includes(file.type)) {
      setErrorImage("B???n ph???i ch???n m???t ???nh");
      return;
    }
    const sotrageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(sotrageRef, file);
    setIsShowProgress(true);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setErrorImage("");
          setStaff({
            ...staff,
            image: downloadURL,
          });
          return downloadURL;
        });
      }
    );
    return;
  };
  console.log(user);
  const onSubmit = async (data: staffType) => {
    try {
      const data: staffType = {
        ...staff,
        address: address.province.value !== 0 ? JSON.stringify(address) : null,
      };
      if (data.id) {
        await baseApi.put("accounts", data);
        props.onHide();
      } else {
        await baseApi.post("accounts", data);
        history.push("/staff/list");
      }
      const action = setShow({
        show: true,
        content: "???? l??u th??ng tin nh??n vi??n",
        type: "success",
      });
      dispatch(action);
    } catch (error) {
      console.log(error);
      const action = setShow({
        show: true,
        content: "L??u th??ng tin nh??n vi??n th???t b???i !",
        type: "error",
      });
      dispatch(action);
    }
  };
  const {
    register,
    setValue,
    clearErrors,
    reset,
    setError,
    handleSubmit,
    formState: { errors },
  } = useForm<staffType>({
    reValidateMode: "onBlur",
    shouldFocusError: false,
    resolver: yupResolver(staff.id ? schemaValidateUpdate : schemaValidate),
  });

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} id="staff-form">
      <div className="card-body" style={{ padding: 15 }}>
        <div className="form-group">
          <div className="row">
            <div className={staff.id ? "col-12" : "col-8"}>
              <div className="form-group">
                <label htmlFor="fullName">
                  H??? v?? t??n<span className="ml-1 text-danger">*</span>
                </label>
                <input
                  onFocus={() => clearErrors(["fullName"])}
                  type="text"
                  {...register("fullName", {
                    value: staff.fullName,
                    onChange: inputChange,
                  })}
                  className={
                    errors.fullName ? "form-control is-invalid" : "form-control"
                  }
                  {...setValue("fullName", staff.fullName)}
                  id="fullName"
                  placeholder="H??? v?? T??n"
                />
                <p style={{ color: "red" }}>{errors.fullName?.message}</p>
              </div>
              <div className="form-group">
                <label htmlFor="phone">
                  S??? ??i???n tho???i<span className="ml-1 text-danger">*</span>
                </label>
                <input
                  onFocus={() => clearErrors(["phone"])}
                  type="text"
                  {...register("phone", {
                    value: staff.phone,
                    onChange: inputChange,
                    onBlur: (e) => checkUnique("phone", e.target.value),
                  })}
                  className={
                    errors.phone ? "form-control  is-invalid" : "form-control"
                  }
                  {...setValue("phone", staff.phone)}
                  id="phone"
                  placeholder="S??? ??i???n tho???i"
                />
                <p style={{ color: "red" }}>{errors.phone?.message}</p>
              </div>
            </div>
            {!staff.id && (
              <div className="col-4">
                <div className="form-group">
                  <label htmlFor="username">
                    T??i kho???n<span className="ml-1 text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    onFocus={() => clearErrors(["username"])}
                    {...register("username", {
                      value: staff.username,
                      onChange: inputChange,
                      onBlur: (e) => checkUnique("username", e.target.value),
                    })}
                    className={
                      errors.username
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    placeholder="T??i kho???n"
                  />
                  <p style={{ color: "red" }}>{errors.username?.message}</p>
                </div>
                <div className="from-group">
                  <label htmlFor="password">
                    M???t kh???u<span className="ml-1 text-danger">*</span>
                  </label>
                  <input
                    onFocus={() => clearErrors(["password"])}
                    type="password"
                    {...register("password", {
                      onChange: inputChange,
                    })}
                    className={
                      errors.password
                        ? "form-control is-invalid"
                        : "form-control"
                    }
                    id="password"
                    placeholder="M???t kh???u"
                  />
                  <p style={{ color: "red" }}>{errors.password?.message}</p>
                </div>
              </div>
            )}
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
          <div className="row">
            <div className="col-8">
              <div className="form-group mt-3">
                <label htmlFor="address">
                  ?????a ch???<span className="ml-1 text-danger">*</span>
                </label>
                <input
                  type="text"
                  onFocus={() => clearErrors(["addressDetail"])}
                  {...register("addressDetail", {
                    value: staff.address,
                    onChange: inputChange,
                  })}
                  className={
                    errors.addressDetail
                      ? "form-control is-invalid"
                      : "form-control"
                  }
                  {...setValue("addressDetail", staff.addressDetail)}
                  id="addressDetail"
                  placeholder="?????a ch???"
                />
                <p style={{ color: "red" }}>{errors.addressDetail?.message}</p>
              </div>
              <div>
                <label htmlFor="roles">Ch???c v???</label>
                <Select
                  options={optionRole}
                  isMulti
                  isClearable={false}
                  value={optionRole.filter((obj: optionType) =>
                    staff.roles.includes(obj.value)
                  )}
                  components={{ MultiValueRemove }}
                  onChange={handleChangeRole}
                />
              </div>

              <div className="row mt-3">
                <div className="col-6">
                  <div className="form-group">
                    <label htmlFor="gender">Gi???i t??nh</label>
                    <Select
                      {...register("gender")}
                      options={optionsGender}
                      value={
                        staff.gender
                          ? { value: 1, label: "Nam" }
                          : { value: 0, label: "N???" }
                      }
                      onChange={handleChangeGender}
                    />
                  </div>
                </div>
                <div className="col-6">
                  <div className="form-group">
                    <label htmlFor="status">Tr???ng th??i</label>
                    <Select
                      {...register("status")}
                      options={optionSelectStatus}
                      value={
                        staff.status
                          ? { value: 1, label: "??ang l??m" }
                          : { value: 0, label: "???? ngh???" }
                      }
                      onChange={handleChangeStatus}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="birth">Ng??y sinh</label>
                <DatePicker
                  maxDate={new Date()}
                  {...register("birth")}
                  format="dd/MM/yyyy"
                  clearIcon={null}
                  className="form-control"
                  activeStartDate={staff.birth}
                  value={staff.birth}
                  onChange={handleChangeDate}
                />
              </div>
            </div>

            <div className="col-4 mt-3">
              <label htmlFor="image" className="form-label">
                ???nh
              </label>
              <div
                className="border"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  height: 280,
                  borderRadius: 4,
                }}
              >
                <label
                  htmlFor="image"
                  className="form-label"
                  style={{ width: "100%" }}
                >
                  <img
                    src={staff.image || placeholder}
                    alt="product"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </label>
              </div>

              <input
                id="image"
                style={{ display: "none" }}
                type="file"
                accept="image/*"
                onChangeCapture={handleChoseFile}
                className={
                  errorImage
                    ? "custom-file-input is-invalid"
                    : "custom-file-input"
                }
                {...register("image")}
              />
              <p style={{ color: "red" }}>{errorImage}</p>
              <Progress now={progress} isDisplay={isShowProgress} />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
