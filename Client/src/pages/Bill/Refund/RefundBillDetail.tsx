import baseApi from "api/baseApi";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import moment from "moment";
import { convertOrderDetailStatus } from "utils/convertStatus";
import { ProductDetailRequest } from "pages/Product/types";
import { useDispatch, useSelector } from "react-redux";
import { customerType } from "interfaces/customerType.interface";
import MyBadge from "components/Bedge/MyBadge";
import { Link } from "react-router-dom";
import { formatter } from "types";
import {
  OrderDetailRequest,
  OrderRequest,
} from "../SaleBill/interface/typesSaleBill";

function RefundBillDetail() {
  const { id } = useParams() as any;
  const history = useHistory();
  const [orders, setOrders] = useState({} as OrderRequest);
  const [orderDetails, setOrderDetails] = useState([] as OrderDetailRequest[]);
  const [currentOrderDetails, setCurrentOrderDetails] = useState(
    {} as OrderDetailRequest
  );
  const [productDetail, setProductDetail] = useState(
    {} as ProductDetailRequest
  );

  const [customer, setCustomer] = useState({} as customerType);

  useEffect(() => {
    async function getOrder() {
      const response = await baseApi.getById("orders/custom", id);
      setOrders(response.data);
      console.log("abc", response);
    }

    async function getOrderDetails() {
      const response = await baseApi.getById("orders/custom", id);
      setOrderDetails(response.data.orderDetails);
      if (response.data) {
        setCurrentOrderDetails(response.data.orderDetails[0]);
      }
    }
    async function getProductDetail() {
      const response = await baseApi.getById("orders/custom", id);
      setProductDetail(response.data.orderDetails.productDetail);
    }

    const getCustomers = async () => {
      const response = await baseApi.getById("orders/custom", id);
      setCustomer(response.data.customer);
      console.log(response);
    };

    getProductDetail();
    getCustomers();
    getOrder();
    getOrderDetails();
  }, [id]);

  return (
    <div>
      <section className="content-header">
        <div className="container-fluid">
          <div className="d-flex   mb-2 algin-items-center justify-content-space-between">
            <div>
              <h1>Chi ti???t ho?? ????n</h1>
            </div>
            <div style={{ flex: "1" }}> </div>
            <div>
              <button
                className="btn btn-default"
                onClick={() => history.push("/bill/sale/list")}
              >
                Quay l???i
              </button>
            </div>
            <div>
              <button
                className="btn btn-primary ml-2"
                onClick={() => {
                  history.push(`/bill/sale/${id}/update`);
                }}
              >
                S???a ????n h??ng
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-8">
              <div className="col">
                <div className="card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="filed-info mt-1 d-flex">
                          <span className="fa fa-info-circle mt-1"></span>
                          <span>Tr???ng th??i: </span>
                          <span
                            className="properties d-flex"
                            style={{ fontSize: "20px" }}
                          >
                            <MyBadge
                              content={convertOrderDetailStatus(orders.status)}
                              color={
                                orders.status === 1 ? "success" : "secondary"
                              }
                            />
                          </span>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="filed-info mt-1 d-flex">
                          <span
                            className="far fa-calendar-plus fa"
                            // style={{ color: "rgb(0,137,255)" }}
                          ></span>
                          <span>Ng??y t???o: </span>
                          <span className="properties">
                            {moment(orders.createdAt).format("L")}
                          </span>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="filed-info mt-1 d-flex">
                          <span
                            className="far fa-calendar-check fa"
                            // style={{ color: "rgb(0,137,255)" }}
                          ></span>
                          <span>Ng??y c???p nh???t: </span>
                          <span className="properties">
                            {moment(orders.updatedAt).format("L")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card">
                  <div className="card-header header">
                    <span
                      className="fas fa-portrait fa"
                      style={{
                        fontSize: "27px",
                        // color: "rgb(15,209,134)"
                      }}
                    ></span>
                    <span>Th??ng tin kh??ch h??ng</span>
                  </div>
                  <div className="card-body">
                    {orderDetails ? (
                      <div className="row">
                        <div className="col-lg-5">
                          <div className="filed-info mt-2 d-flex">
                            <span className="fa fa-user-circle"></span>
                            <span className="properties">Kh??ch h??ng:</span>
                            <span className="properties ">
                              <Link to={`/customer/${customer.id}/detail`}>
                                {customer.name}
                              </Link>
                            </span>
                          </div>
                          <div className="filed-info mt-3 d-flex">
                            <span
                              className="fa fa-phone"
                              style={
                                {
                                  // color: "rgb(15,209,134)",
                                }
                              }
                            ></span>
                            <span
                              className="properties"
                              style={{ marginLeft: "7px" }}
                            >
                              ??i???n tho???i:
                            </span>
                            <span className="properties">
                              {" "}
                              <Link to={`/customer/${customer.id}/detail`}>
                                {customer.phone}
                              </Link>
                            </span>
                          </div>
                        </div>
                        <div className="col-lg-7">
                          <div className="filed-info mt-2 d-flex">
                            <span
                              className="fa fa-envelope-o"
                              style={
                                {
                                  // color: "rgb(255,114,0)",
                                }
                              }
                            ></span>
                            <span>Email: </span>
                            <span className="properties">
                              <Link to={`/customer/${customer.id}/detail`}>
                                {customer.email}
                              </Link>
                            </span>
                          </div>

                          <div className="filed-info mt-3 d-flex">
                            <span
                              className="fa fa-map-marker"
                              style={{
                                marginLeft: "4px",
                                // color: "red"
                              }}
                            ></span>
                            <span style={{ marginLeft: "5px" }}>?????a ch???: </span>
                            <span className="properties">
                              {customer.address}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      "Ch??a c?? th??ng tin chi ti???t phi??n b???n"
                    )}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card">
                  <div className="card-header ">
                    <span
                      className="fa fa-cube"
                      style={{
                        fontSize: "25px",
                        // color: "rgb(135,108,97)"
                      }}
                    ></span>
                    <span
                      style={{
                        fontSize: "1.4rem",
                      }}
                    >
                      Th??ng tin s???n ph???m
                    </span>
                  </div>
                  <div className="card-body text-center">
                    {/* {orderDetails.length > 0 ? (
                      <DataTableSaleBillDetaill data={orderDetails} />
                    ) : (
                      <div>Ch??a c?? s???n ph???m</div>
                    )} */}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="col">
                <div className="card">
                  <div className="card-header header">
                    <span
                      className="fas fa-money-bill-alt fa "
                      style={{
                        fontSize: "25px",
                        // color: "rgb(40,167,69)"
                      }}
                    ></span>
                    <span>Thanh to??n</span>
                  </div>
                  <div className="card-body">
                    <div className="row mt-3">
                      <div className="col-6 text-left">
                        <span className="fas fa-dollar-sign fa"></span>
                        <span>T???ng ti???n: </span>
                      </div>
                      <div className="col-6 text-right">
                        <span style={{ color: "rgb(40,167,69)" }}>
                          {formatter.format(orders.totalPrice)}
                        </span>
                      </div>
                    </div>
                    <div className="row  mt-3">
                      <div className="col-6 text-left">
                        <span className="fas fa-arrow-right fa"></span>
                        <span>Kh??ch ????a: </span>
                      </div>
                      <div className="col-6 text-right">
                        <span>{formatter.format(orders.money)}</span>
                      </div>
                    </div>
                    <div className="row  mt-3">
                      <div className="col-6 text-left">
                        <span className="fas fa-hand-point-down fa"></span>
                        <span>Chi???t kh???u: </span>
                      </div>
                      <div className="col-6 text-right">
                        <span style={{ color: "red" }}>
                          {formatter.format(orders.discount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="card">
                  <div className="card-header header">
                    <span
                      className="fas fa-user-tag fa"
                      style={{
                        fontSize: "25px",
                      }}
                    ></span>
                    <span
                      style={{
                        fontSize: "1.4rem",
                      }}
                    >
                      Nh??n vi??n h??? tr???
                    </span>
                  </div>
                  <div className="card-body">
                    {orderDetails ? (
                      <div className="row">
                        <div className="col-lg">
                          <div className="filed-info d-flex">
                            <span className="fas fa-user fa"></span>
                            <span>Nh??n vi??n b??n h??ng: </span>
                            <span className="properties employee">
                              {orders.accountName}
                            </span>
                          </div>
                          <div className="filed-info mt-3 d-flex">
                            <span className="fas fa-edit fa"></span>
                            <span>Ghi ch??: </span>
                            <span className="properties">{orders.note}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      "Ch??a c?? th??ng tin chi ti???t phi??n b???n"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RefundBillDetail;
