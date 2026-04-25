import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Ticket,
  Heart,
  Minus,
  Plus,
  Trash2,
  Navigation,
  LocateFixed,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useSiteSettingsQuery } from "../api/hooks/useSiteSettings";
import { useVerifyCouponMutation } from "../api/hooks/useCoupons";
import { formatPrice, getPriceValue } from "../utils/priceUtils";
import { calculateDistance } from "../utils/distanceUtils";
import { loadSavedCustomer, saveCustomerData } from "../utils/customerStorage";
import { geocodeAddress, buildAddressString } from "../utils/geocode";
import { COLORS } from "../config/colors";
import { restaurantLocation } from "@/constants/business";
import { useLoyalty } from "../hooks/useLoyalty";
import { LoyaltyJoinCheckbox } from "../components/checkout/LoyaltyJoinCheckbox";
import { LoyaltyPointsWidget } from "../components/checkout/LoyaltyPointsWidget";
import {
  getDateInputBounds,
  formatDateLabel,
  formatTimeLabel,
  getAvailableDates,
  getAvailableTimeSlots,
  isDateSelectable,
  parseDateValue,
  resolveOperationsState,
} from "../utils/operations";

// Fix Leaflet icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Restaurant marker: green circle with store icon
const RestaurantIcon = L.divIcon({
  className: "restaurant-marker",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:40px;height:40px;background:var(--primary, #22c55e);border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);color:white;font-size:20px;">🏪</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// "You are here" marker (blue dot for current GPS location)
const YouAreHereIcon = L.divIcon({
  className: "you-are-here-marker",
  html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:white;font-size:14px;font-weight:bold;">●</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const DEFAULT_TIP_OPTIONS = [10, 15, 20, 25];
const DEFAULT_TAX_RATE = 0;
const DEFAULT_MAP_CENTER = [51.505, -0.09];
const DEFAULT_CUSTOMER_FORM = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  acceptsMarketingMessages: true,
  acceptsOrderUpdates: true,
};

/** Returns { lat, lng } with valid numbers so Leaflet never receives undefined. */
function getShopLocation(location) {
  if (!location || typeof location !== "object") {
    return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] };
  }
  let lat = Number(location.lat);
  let lng = Number(location.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { lat, lng };
  }
  // GeoJSON: coordinates = [longitude, latitude]
  const coords = location.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    lat = Number(coords[1]);
    lng = Number(coords[0]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }
  return { lat: DEFAULT_MAP_CENTER[0], lng: DEFAULT_MAP_CENTER[1] };
}

const Checkout = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartTotal,
    orderType: contextOrderType,
    deliveryDetails,
    setDeliveryDetails,
    setShowDeliveryModal,
  } = useCart();
  const navigate = useNavigate();
  const {
    lookup: lookupLoyalty,
    discountValue: loyaltyDiscount,
    pointsRedeemed: loyaltyPointsRedeemed = 0,
  } = useLoyalty();

  const [form, setForm] = useState(() => {
    const saved = loadSavedCustomer();
    return { ...DEFAULT_CUSTOMER_FORM, ...(saved || {}) };
  });

  // Loyalty lookup when phone changes
  useEffect(() => {
    const timer = setTimeout(() => {
      lookupLoyalty(form.phone || "");
    }, 400);

    return () => clearTimeout(timer);
  }, [form.phone, lookupLoyalty]);

  const { data: siteSettings, refetch: refetchSiteSettings } =
    useSiteSettingsQuery();

  useEffect(() => {
    refetchSiteSettings();
  }, [refetchSiteSettings]);

  const shopLocation = getShopLocation(siteSettings?.contactDetails?.location);
  const deliveryZones = siteSettings?.delivery?.zones ?? [];
  const tipOptions =
    siteSettings?.fees?.tip_options?.length > 0
      ? siteSettings.fees.tip_options
      : DEFAULT_TIP_OPTIONS;
  const taxRate =
    siteSettings?.taxes?.sales_tax != null
      ? siteSettings.taxes.sales_tax / 100
      : DEFAULT_TAX_RATE;
  const operationsState = resolveOperationsState(siteSettings || {});
  const canAsap = operationsState.acceptsAsap;
  const canSchedule = operationsState.acceptsScheduled;
  const canCheckout = operationsState.allowsCheckout;
  const modeMessage =
    operationsState.mode === "SCHEDULED_ONLY"
      ? "We are currently accepting scheduled orders only."
      : operationsState.mode === "ORDERS_PAUSED"
        ? "Online ordering is temporarily paused."
        : "";

  const [orderType, setOrderType] = useState(contextOrderType || "delivery");

  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [customerCoords, setCustomerCoords] = useState(null);
  const [matchedZone, setMatchedZone] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [locateLoading, setLocateLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [couponData, setCouponData] = useState(null);
  const verifyCouponMutation = useVerifyCouponMutation();
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState("");
  const [orderTimeType, setOrderTimeType] = useState("asap");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [asapTime, setAsapTime] = useState("");

  const maxScheduleDays = useMemo(
    () => Number(siteSettings?.orders?.maxDays ?? 30),
    [siteSettings?.orders?.maxDays],
  );
  const availableDates = useMemo(
    () =>
      getAvailableDates(siteSettings || {}, {
        maxDays: maxScheduleDays,
        limitOpenDays: 180,
      }),
    [siteSettings, maxScheduleDays],
  );
  const selectedScheduleDate = scheduledDate ? parseDateValue(scheduledDate) : null;
  const availableTimes = getAvailableTimeSlots(siteSettings || {}, selectedScheduleDate);
  const dateInputBounds = useMemo(
    () => getDateInputBounds(siteSettings || {}, new Date()),
    [siteSettings],
  );


  // Sync map center
  useEffect(() => {
    if (shopLocation?.lat != null && shopLocation?.lng != null) {
      setMapCenter([shopLocation.lat, shopLocation.lng]);
    }
  }, [shopLocation?.lat, shopLocation?.lng]);

  // Restore customer pin
  useEffect(() => {
    if (deliveryDetails?.lat != null && deliveryDetails?.lng != null) {
      setCustomerCoords(
        (prev) =>
          prev || { lat: deliveryDetails.lat, lng: deliveryDetails.lng },
      );
    }
  }, [deliveryDetails?.lat, deliveryDetails?.lng]);

  useEffect(() => {
    if (
      orderType !== "delivery" ||
      !deliveryDetails ||
      typeof deliveryDetails !== "object"
    ) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      ...(deliveryDetails.firstName
        ? { firstName: deliveryDetails.firstName }
        : {}),
      ...(deliveryDetails.lastName
        ? { lastName: deliveryDetails.lastName }
        : {}),
      ...(deliveryDetails.phone ? { phone: deliveryDetails.phone } : {}),
    }));
  }, [
    orderType,
    deliveryDetails?.firstName,
    deliveryDetails?.lastName,
    deliveryDetails?.phone,
  ]);

  // Update matched zone
  useEffect(() => {
    if (
      customerCoords &&
      shopLocation?.lat != null &&
      shopLocation?.lng != null
    ) {
      const distance = calculateDistance(
        shopLocation.lat,
        shopLocation.lng,
        customerCoords.lat,
        customerCoords.lng,
      );
      const sortedZones = [...deliveryZones].sort(
        (a, b) => a.radius - b.radius,
      );
      const zone = sortedZones.find((z) => distance <= z.radius);
      setMatchedZone(zone || null);
    } else {
      setMatchedZone(null);
    }
  }, [customerCoords, deliveryZones, shopLocation]);

  const calculateAsapTime = () => {
    const now = new Date();
    const asap = new Date(now.getTime() + 25 * 60000);
    return asap.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    setAsapTime(calculateAsapTime());
  }, []);

  useEffect(() => {
    if (!canAsap && canSchedule) {
      setOrderTimeType("later");
    }
    if (!canSchedule && orderTimeType === "later") {
      setOrderTimeType("asap");
    }
  }, [canAsap, canSchedule, orderTimeType]);

  useEffect(() => {
    if (orderTimeType !== "later") return;
    if (!availableDates.length) {
      setScheduledDate("");
      setScheduledTime("");
      return;
    }
    const parsedDate = scheduledDate ? parseDateValue(scheduledDate) : null;
    if (
      !scheduledDate ||
      !parsedDate ||
      !isDateSelectable(siteSettings || {}, parsedDate)
    ) {
      setScheduledDate(dateInputBounds.min);
      setScheduledTime("");
    }
  }, [
    orderTimeType,
    availableDates.length,
    scheduledDate,
    siteSettings,
    dateInputBounds.min,
  ]);

  useEffect(() => {
    if (orderTimeType !== "later") return;
    if (!scheduledTime) return;
    if (!availableTimes.includes(scheduledTime)) {
      setScheduledTime("");
    }
  }, [orderTimeType, scheduledTime, availableTimes]);

  const handleSetOrderTimeType = (type) => {
    if (type === "asap" && !canAsap) return;
    if (type === "later" && !canSchedule) return;
    if (type === "asap") {
      setAsapTime(calculateAsapTime());
    }
    setOrderTimeType(type);
  };

  const handleScheduledDateChange = (dateValue) => {
    const parsedDate = parseDateValue(dateValue);
    if (!parsedDate || !isDateSelectable(siteSettings || {}, parsedDate)) {
      setSubmitError("Selected date is outside operating hours.");
      return;
    }
    setSubmitError("");
    setScheduledDate(dateValue);
    setScheduledTime("");
  };

  const handleScheduledTimeChange = (timeValue) => {
    if (!timeValue) {
      setScheduledTime("");
      return;
    }
    if (!availableTimes.includes(timeValue)) {
      setSubmitError("Selected time is not available.");
      return;
    }
    setSubmitError("");
    setScheduledTime(timeValue);
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoError("");

    verifyCouponMutation.mutate(promoCode.trim(), {
      onSuccess: (data) => {
        setCouponData(data);
        setPromoApplied(true);
        setPromoError("");
      },
      onError: (error) => {
        setPromoApplied(false);
        setCouponData(null);
        setPromoError(error?.response?.data?.message || "Invalid promo code");
      },
    });
  };

  // Geocode typed address and set pin on map
  const handleLocateAddressOnMap = async () => {
    const address = buildAddressString(deliveryDetails);
    if (!address.trim()) return;
    setGeocodeLoading(true);
    try {
      const coords = await geocodeAddress(address);
      if (coords) {
        setCustomerCoords(coords);
        setDeliveryDetails((prev) => ({
          ...prev,
          lat: coords.lat,
          lng: coords.lng,
        }));
      }
    } finally {
      setGeocodeLoading(false);
    }
  };

  // Use browser GPS for delivery pin and show "You are here" on map
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocateLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCustomerCoords(coords);
        setUserLocation(coords);
        setDeliveryDetails((prev) => ({
          ...prev,
          lat: coords.lat,
          lng: coords.lng,
        }));
        setLocateLoading(false);
      },
      () => setLocateLoading(false),
    );
  };

  // Search location by address/place and set as delivery pin
  const handleSearchLocation = async () => {
    const query = searchQuery.trim();
    if (!query) return;
    setSearchLoading(true);
    try {
      const coords = await geocodeAddress(query);
      if (coords) {
        setCustomerCoords(coords);
        setDeliveryDetails((prev) => ({
          ...prev,
          lat: coords.lat,
          lng: coords.lng,
          address1: query,
        }));
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const subtotal = cartTotal;

  // Calculate discount
  let discount = 0;
  if (promoApplied && couponData) {
    if (couponData.type === "percentage") {
      discount = (subtotal * couponData.amount) / 100;
    } else {
      discount = couponData.amount;
    }
  }

  const tax = subtotal * taxRate;
  const tipAmount = customTip
    ? Number(customTip) || 0
    : selectedTip
      ? subtotal * (selectedTip / 100)
      : 0;

  const deliveryFee = orderType === "delivery" ? (matchedZone?.fee ?? 0) : 0;
  const total = subtotal + tax + tipAmount + deliveryFee - discount - loyaltyDiscount;

  // Build delivery address string
  const deliveryAddress = deliveryDetails
    ? [
        deliveryDetails.address1,
        deliveryDetails.apt,
        deliveryDetails.city,
        deliveryDetails.state,
        deliveryDetails.zipcode,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  // Single zoom control (disable default to avoid duplicate)
  function MapZoomControl() {
    const map = useMap();
    useEffect(() => {
      const zoomControl = L.control.zoom({ position: "topright" });
      zoomControl.addTo(map);
      return () => zoomControl.remove();
    }, [map]);
    return null;
  }

  // Fit map to show restaurant + delivery pin (and optional "you are here")
  function FitMapToBounds({ shop, delivery, youAreHere }) {
    const map = useMap();
    useEffect(() => {
      const points = [];
      if (shop?.lat != null && shop?.lng != null)
        points.push([shop.lat, shop.lng]);
      if (delivery?.lat != null && delivery?.lng != null)
        points.push([delivery.lat, delivery.lng]);
      if (youAreHere?.lat != null && youAreHere?.lng != null)
        points.push([youAreHere.lat, youAreHere.lng]);
      if (points.length < 2) return;
      try {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } catch {
        // fitBounds can throw if points are invalid; ignore
      }
    }, [
      map,
      shop?.lat,
      shop?.lng,
      delivery?.lat,
      delivery?.lng,
      youAreHere?.lat,
      youAreHere?.lng,
    ]);
    return null;
  }

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setCustomerCoords(e.latlng);
        setDeliveryDetails((prev) => ({
          ...prev,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
          address1: prev?.address1 || "Selected from map",
        }));
      },
    });

    return customerCoords === null ? null : (
      <Marker position={customerCoords}>
        <Popup>
          <strong>Your delivery address</strong>
          {matchedZone && (
            <>
              <br />
              Zone: {matchedZone.radius}km · Fee:{" "}
              {formatPrice(matchedZone.fee, siteSettings)}
            </>
          )}
        </Popup>
      </Marker>
    );
  };

  // Map cart items to order items format
  const mapCartItemsToOrderItems = () => {
    return cartItems.map((item) => {
      const unitPrice = getPriceValue(item.price);

      // Map modifiers from cart format to order format
      const modifiers = [];
      if (item.modifiers && typeof item.modifiers === "object") {
        Object.entries(item.modifiers).forEach(([groupTitle, value]) => {
          if (!value) return;

          if (typeof value === "string") {
            // Single modifier selected by label
            const product = item; // reference back to original product data
            const group = product.modifier_groups?.find((mg) => {
              const g = mg.modifier_group || mg;
              return g.name === groupTitle || g.display_name === groupTitle;
            });
            const modData = group?.modifiers?.find((m) => m.name === value);
            if (modData) {
              modifiers.push({
                modifier_id: modData.id || modData._id,
                name_snapshot: modData.name || value,
                unit_price_delta: modData.price ?? 0,
              });
            }
          } else if (Array.isArray(value)) {
            // Multiple modifiers (checkbox style)
            value.forEach((label) => {
              const product = item;
              const group = product.modifier_groups?.find((mg) => {
                const g = mg.modifier_group || mg;
                return g.name === groupTitle || g.display_name === groupTitle;
              });
              const modData = group?.modifiers?.find((m) => m.name === label);
              if (modData) {
                modifiers.push({
                  modifier_id: modData.id || modData._id,
                  name_snapshot: modData.name || label,
                  unit_price_delta: modData.price ?? 0,
                });
              }
            });
          } else if (typeof value === "object") {
            // Complex modifiers with levels/placements
            Object.entries(value).forEach(([label, details]) => {
              if (!details) return;
              const product = item;
              const group = product.modifier_groups?.find((mg) => {
                const g = mg.modifier_group || mg;
                return g.name === groupTitle || g.display_name === groupTitle;
              });
              const modData = group?.modifiers?.find((m) => m.name === label);
              if (modData) {
                modifiers.push({
                  modifier_id: modData.id || modData._id,
                  name_snapshot: modData.name || label,
                  unit_price_delta: modData.price ?? 0,
                  quantity_label_snapshot:
                    typeof details === "object" ? details.level : undefined,
                  selected_side:
                    typeof details === "object" ? details.side : undefined,
                });
              }
            });
          }
        });
      }

      return {
        menu_item_id: item.id,
        name_snap: item.name,
        size_id: item.size?.size_id || undefined,
        size_snap: item.size?.label || item.size?.name || undefined,
        unit_price: unitPrice,
        quantity: item.qty,
        modifiers,
      };
    });
  };

  const handleSubmitOrder = () => {
    if (!canCheckout) {
      setSubmitError(modeMessage || "Online ordering is currently unavailable.");
      return;
    }

    if (orderTimeType === "asap" && !canAsap) {
      setSubmitError("ASAP ordering is currently unavailable.");
      return;
    }
    if (orderTimeType === "later" && !canSchedule) {
      setSubmitError("Scheduled ordering is currently unavailable.");
      return;
    }

    // Validate required fields
    if (!form.phone.trim()) {
      setSubmitError("Phone number is required");
      return;
    }
    if (!form.firstName.trim()) {
      setSubmitError("First name is required");
      return;
    }

    if (orderType === "delivery") {
      if (deliveryZones.length === 0) {
        setSubmitError(
          "Delivery is not available (no delivery zones configured).",
        );
        return;
      }
      if (!customerCoords) {
        setSubmitError("Please select your delivery location on the map.");
        return;
      }
      if (!matchedZone) {
        setSubmitError("Your location is outside our delivery area.");
        return;
      }
      const minOrder = matchedZone.min_order ?? 0;
      if (minOrder > 0 && subtotal < minOrder) {
        setSubmitError(
          `Minimum order for your area is ${formatPrice(minOrder, siteSettings)}.`,
        );
        return;
      }
    }

    if (orderTimeType === "later") {
      if (!scheduledDate || !scheduledTime) {
        setSubmitError("Please choose a valid schedule date and time.");
        return;
      }
      const parsedDate = parseDateValue(scheduledDate);
      if (!parsedDate || !isDateSelectable(siteSettings || {}, parsedDate)) {
        setSubmitError("Selected date is outside operating hours.");
        return;
      }
      if (!availableTimes.includes(scheduledTime)) {
        setSubmitError("Selected time is not available.");
        return;
      }
    }

    setSubmitError("");

    // Save customer data for next visit
    saveCustomerData(form);

    const orderPayload = {
      customer: {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email || undefined,
        phone: form.phone,
        accepts_marketing_messages: form.acceptsMarketingMessages,
        accepts_order_updates: form.acceptsOrderUpdates,
      },
      order_type: orderType || "pickup",
      service_time_type: orderTimeType === "asap" ? "ASAP" : "Schedule",
      schedule_time:
        orderTimeType === "later" && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString()
          : null,
      money: {
        subtotal: subtotal,
        discount: discount,
        delivery_fee: deliveryFee,
        tax_total: tax,
        tips: tipAmount,
        total_amount: total,
        currency: siteSettings?.currency || "USD",
        coupon_code: promoApplied ? promoCode : undefined,
        loyalty_discount_amount:
          loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
        rewards_points_used:
          loyaltyPointsRedeemed > 0 ? loyaltyPointsRedeemed : undefined,
        // Payment type/token will be injected by the dedicated Payment screen
      },
      delivery:
        orderType === "delivery" && deliveryDetails
          ? {
              name: `${form.firstName} ${form.lastName}`.trim(),
              phone: form.phone,
              address: {
                address1: deliveryDetails.address1,
                apt: deliveryDetails.apt,
                city: deliveryDetails.city,
                state: deliveryDetails.state,
                zipcode: deliveryDetails.zipcode,
                formatted_address: deliveryAddress,
                ...(customerCoords && {
                  lat: customerCoords.lat,
                  lng: customerCoords.lng,
                }),
              },
            }
          : undefined,
      notes: "",
      items: mapCartItemsToOrderItems(),
    };

    // Forward the assembled payload directly to the Payment processor page
    navigate("/payment", { state: { orderPayload } });
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div
        className="min-h-screen pt-32 pb-20 px-4"
        style={{
          "--primary": COLORS.primary,
          "--text-primary": COLORS.textPrimary,
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 text-center px-6">
            Add some items to your cart before checking out.
          </p>
          <Link
            to="/menu"
            className="px-8 py-3 bg-(--primary) text-white font-bold rounded-full hover:brightness-110 transition-all shadow-lg shadow-(--primary)/20 flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 pt-32 pb-20 px-4 md:px-8"
      style={{
        "--primary": COLORS.primary,
        "--text-primary": COLORS.textPrimary,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Back to Cart */}
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-(--primary) font-medium mb-6 transition-colors group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Cart
        </Link>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-(--text-primary) mb-1">
            Checkout
          </h1>
          <p className="text-gray-500 text-lg">
            Finish your {orderType === "delivery" ? "delivery" : "pickup"} order
          </p>
        </div>

        {modeMessage ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {modeMessage}
          </div>
        ) : null}

        {/* Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* ── LEFT COLUMN: Form ── */}
          <div className="lg:col-span-3 space-y-8">
            {/* Contact Information */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-(--primary) text-white text-sm font-bold flex items-center justify-center">
                  1
                </span>
                Contact Information
              </h2>

              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrderType("delivery")}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      orderType === "delivery"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    Delivery
                  </button>
                  <button
                    onClick={() => setOrderType("pickup")}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      orderType === "pickup"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    Pick Up
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <input
                    name="acceptsMarketingMessages"
                    type="checkbox"
                    checked={form.acceptsMarketingMessages}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-(--primary) focus:ring-(--primary)/30"
                  />
                  <span className="leading-6">
                    I want to receive marketing and rewards program emails and text messages.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  <input
                    name="acceptsOrderUpdates"
                    type="checkbox"
                    checked={form.acceptsOrderUpdates}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-(--primary) focus:ring-(--primary)/30"
                  />
                  <span className="leading-6">
                    I want to receive emails and text messages about my order updates.
                  </span>
                </label>
              </div>

              <div className="mt-6 p-4 bg-gray-100 rounded-lg flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Location (
                    {orderType === "delivery" ? "Delivery" : "Pick Up"})
                  </p>
                  <p className="text-sm text-gray-600">
                    {orderType === "delivery"
                      ? deliveryAddress
                      : restaurantLocation}
                  </p>
                </div>

                {orderType === "delivery" && (
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="text-(--primary) text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </section>

            {/* Order Time */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-(--primary) text-white text-sm font-bold flex items-center justify-center">
                  2
                </span>
                Order Time
              </h2>

              <div className="mb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSetOrderTimeType("asap")}
                    disabled={!canAsap}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      orderTimeType === "asap"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    } ${!canAsap ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    ASAP {asapTime && `(${asapTime})`}
                  </button>
                  <button
                    onClick={() => handleSetOrderTimeType("later")}
                    disabled={!canSchedule}
                    className={`px-4 py-2 rounded-lg border font-medium text-sm transition-all ${
                      orderTimeType === "later"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    } ${!canSchedule ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    Later
                  </button>
                </div>
              </div>

              {orderTimeType === "later" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label
                      htmlFor="scheduledDate"
                      className="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                      Select Date
                    </label>
                    <input
                      id="scheduledDate"
                      name="scheduledDate"
                      type="date"
                      value={scheduledDate}
                      min={dateInputBounds.min}
                      max={dateInputBounds.max}
                      onChange={(e) => handleScheduledDateChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="scheduledTime"
                      className="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                      Select Time
                    </label>
                    <input
                      id="scheduledTime"
                      name="scheduledTime"
                      type="time"
                      step={900}
                      list="scheduled-time-options"
                      value={scheduledTime}
                      onChange={(e) => handleScheduledTimeChange(e.target.value)}
                      disabled={!scheduledDate || availableTimes.length === 0}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                    />
                    <datalist id="scheduled-time-options">
                      {availableTimes.map((timeValue) => (
                        <option key={timeValue} value={timeValue} />
                      ))}
                    </datalist>
                    {scheduledDate && availableTimes.length === 0 ? (
                      <p className="mt-2 text-xs text-gray-500">
                        No valid slots available for this date.
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
              {orderTimeType === "later" && scheduledDate && scheduledTime ? (
                <p className="mt-4 text-sm font-medium text-gray-700">
                  {`${orderType === "delivery" ? "Delivery" : "Pickup"} on ${formatDateLabel(parseDateValue(scheduledDate))} at ${formatTimeLabel(scheduledTime)}`}
                </p>
              ) : null}
            </section>

            {/* Delivery Map & Zone Selection */}
            {orderType === "delivery" && (
              <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                <h2 className="text-xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-(--primary) text-white text-sm font-bold flex items-center justify-center">
                    3
                  </span>
                  Set Delivery Location
                </h2>
                {deliveryZones.length === 0 ? (
                  <div className="mb-4 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm">
                    Delivery zones are not configured. Please choose pickup or
                    contact the store.
                  </div>
                ) : (
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-gray-500">
                      Please click on the map to pin your exact delivery
                      location.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeliveryModal(true)}
                      className="text-sm font-medium text-(--primary) hover:underline flex items-center gap-1"
                    >
                      <MapPin size={14} />
                      Change delivery address
                    </button>
                  </div>
                )}

                {deliveryZones.length > 0 && (
                  <>
                    {/* Search + action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <div className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                          <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="Search address or place..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSearchLocation()
                            }
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSearchLocation}
                          disabled={searchLoading || !searchQuery.trim()}
                          className="px-4 py-2.5 rounded-xl border border-(--primary) bg-(--primary) text-white font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                          {searchLoading ? "Searching…" : "Search"}
                        </button>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleLocateAddressOnMap}
                          disabled={
                            geocodeLoading || !deliveryDetails?.address1
                          }
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          <LocateFixed size={16} />
                          {geocodeLoading ? "Locating…" : "Locate address"}
                        </button>
                        <button
                          type="button"
                          onClick={handleUseMyLocation}
                          disabled={locateLoading}
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-(--primary) bg-(--primary)/10 text-(--primary) hover:bg-(--primary)/20 disabled:opacity-50 text-sm font-medium"
                        >
                          <Navigation size={16} />
                          {locateLoading ? "Getting…" : "My location"}
                        </button>
                      </div>
                    </div>

                    {/* Map full width, then info card below */}
                    <div className="flex flex-col gap-4">
                      <div className="w-full min-h-[420px] rounded-xl overflow-hidden border border-gray-200 relative z-10">
                        <MapContainer
                          center={mapCenter}
                          zoom={13}
                          style={{
                            height: "100%",
                            minHeight: "420px",
                            width: "100%",
                          }}
                          scrollWheelZoom={true}
                          zoomControl={false}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapZoomControl />
                          <FitMapToBounds
                            shop={shopLocation}
                            delivery={customerCoords}
                            youAreHere={userLocation}
                          />

                          {/* Restaurant marker */}
                          <Marker
                            position={[shopLocation.lat, shopLocation.lng]}
                            icon={RestaurantIcon}
                          >
                            <Popup>
                              <strong>Restaurant</strong>
                              {(siteSettings?.contactDetails
                                ?.formattedAddress ||
                                siteSettings?.contactDetails?.address) && (
                                <>
                                  <br />
                                  {siteSettings.contactDetails
                                    .formattedAddress ||
                                    (() => {
                                      const a =
                                        siteSettings.contactDetails.address;
                                      if (!a || typeof a !== "object")
                                        return "";
                                      return [
                                        a.street,
                                        [a.city, a.state]
                                          .filter(Boolean)
                                          .join(", "),
                                        a.zipCode,
                                        a.country,
                                      ]
                                        .filter(Boolean)
                                        .join(", ");
                                    })()}
                                </>
                              )}
                              {siteSettings?.contactDetails?.contact && (
                                <>
                                  <br />
                                  {siteSettings.contactDetails.contact}
                                </>
                              )}
                            </Popup>
                          </Marker>

                          {/* Delivery zones – click on zone also sets delivery pin */}
                          {deliveryZones.map((zone, idx) => (
                            <Circle
                              key={idx}
                              center={[shopLocation.lat, shopLocation.lng]}
                              radius={zone.radius * 1000}
                              pathOptions={{
                                color: "green",
                                fillColor: "green",
                                fillOpacity: 0.15,
                                weight: 2,
                              }}
                              eventHandlers={{
                                click: (e) => {
                                  const { lat, lng } = e.latlng;
                                  setCustomerCoords({ lat, lng });
                                  setDeliveryDetails((prev) => ({
                                    ...prev,
                                    lat,
                                    lng,
                                    address1:
                                      prev?.address1 || "Selected from map",
                                  }));
                                },
                              }}
                            />
                          ))}

                          <LocationMarker />

                          {userLocation && (
                            <Marker
                              position={[userLocation.lat, userLocation.lng]}
                              icon={YouAreHereIcon}
                            >
                              <Popup>
                                <strong>You are here</strong>
                              </Popup>
                            </Marker>
                          )}
                        </MapContainer>
                        <p className="text-xs text-gray-500 mt-2">
                          Click anywhere on the map (including green zones) to
                          set your delivery address.
                        </p>
                      </div>

                      {/* Delivery info panel – beside map */}
                      <div className="lg:w-72 shrink-0">
                        {customerCoords ? (
                          <div
                            className="p-4 rounded-xl border transition-all duration-300 h-full"
                            style={{
                              backgroundColor: matchedZone
                                ? "#f0fdf4"
                                : "#fef2f2",
                              borderColor: matchedZone ? "#bbf7d0" : "#fecaca",
                            }}
                          >
                            <p
                              className={`font-bold ${matchedZone ? "text-(--primary)" : "text-red-700"}`}
                            >
                              {matchedZone
                                ? "Location in Delivery Zone"
                                : "Outside Delivery Area"}
                            </p>
                            {matchedZone && (
                              <>
                                <p className="text-sm text-(--primary) opacity-80 mt-1">
                                  Delivery Fee:{" "}
                                  {formatPrice(matchedZone.fee, siteSettings)}
                                </p>
                                {matchedZone.min_order != null &&
                                  matchedZone.min_order > 0 && (
                                    <p className="text-sm text-(--primary) opacity-80 mt-0.5">
                                      Min. order:{" "}
                                      {formatPrice(
                                        matchedZone.min_order,
                                        siteSettings,
                                      )}
                                      {subtotal < matchedZone.min_order && (
                                        <span className="text-amber-600 ml-1">
                                          (add{" "}
                                          {formatPrice(
                                            matchedZone.min_order - subtotal,
                                            siteSettings,
                                          )}{" "}
                                          more)
                                        </span>
                                      )}
                                    </p>
                                  )}
                              </>
                            )}
                            {!matchedZone && (
                              <p className="text-sm text-red-600 font-medium mt-1">
                                Sorry, we don't deliver to this distance.
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-500 text-sm h-full flex items-center justify-center">
                            Click on the map or search for an address to set
                            your delivery location.
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Promo Code */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-(--primary) text-white text-sm font-bold flex items-center justify-center">
                  {orderType === "delivery" ? "4" : "3"}
                </span>
                Promo Code
              </h2>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Ticket
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (promoApplied) setPromoApplied(false);
                    }}
                    className="w-full pl-11 pr-4 py-3 bg-linear-to-br from-(--primary)/5 to-transparent border-l-4 border-(--primary) rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                  />
                </div>
                <button
                  onClick={handleApplyPromo}
                  disabled={!promoCode.trim() || verifyCouponMutation.isPending}
                  className="px-6 py-3 bg-(--primary) text-white font-bold rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {verifyCouponMutation.isPending ? "Checking..." : "Apply"}
                </button>
              </div>
              {promoError && (
                <p className="mt-3 text-sm text-red-500 font-medium">
                  {promoError}
                </p>
              )}
              {promoApplied && couponData && (
                <p className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1">
                  <Ticket size={14} />
                  Applied!{" "}
                  {couponData.type === "percentage"
                    ? `${couponData.amount}% off`
                    : `${formatPrice(couponData.amount, siteSettings)} off`}
                </p>
              )}
            </section>

            {/* Loyalty Rewards */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-(--primary) text-white text-sm font-bold flex items-center justify-center">
                  {orderType === "delivery" ? "5" : "4"}
                </span>
                Rewards & Loyalty
              </h2>
              
              <LoyaltyJoinCheckbox 
                phone={form.phone} 
                name={`${form.firstName} ${form.lastName}`} 
                email={form.email} 
              />

              <LoyaltyPointsWidget 
                phone={form.phone} 
                subtotal={subtotal}
              />
            </section>
          </div>

          {/* ── RIGHT COLUMN: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 sticky top-28">
              <h2 className="text-xl font-bold text-(--text-primary) mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-(--primary)" />
                Your Bag
                <span className="ml-auto text-sm font-medium text-gray-400">
                  {cartItems.reduce((s, i) => s + i.qty, 0)} items
                </span>
              </h2>

              {orderType === "delivery" &&
                (deliveryAddress || deliveryDetails) && (
                  <div className="mb-5 p-4 bg-(--primary)/10 rounded-xl border border-(--primary)/20">
                    <div className="flex items-start gap-2.5">
                      <MapPin
                        size={16}
                        className="text-(--primary) mt-0.5 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700 mb-0.5">
                          Delivery Location
                        </p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {deliveryAddress || "Not set"}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowDeliveryModal(true)}
                          className="mt-2 text-xs font-medium text-(--primary) hover:underline"
                        >
                          Change delivery address
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Cart Items */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {cartItems.map((item) => {
                  const unitPrice = getPriceValue(item.price);
                  const lineTotal = unitPrice * item.qty;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 items-start group p-3 rounded-xl hover:bg-gray-50/80 transition-colors"
                    >
                      {/* Image */}
                      <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 p-1.5 flex-shrink-0 overflow-hidden">
                        <img
                          src={item.src}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatPrice(unitPrice, siteSettings)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-1 py-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-(--primary)"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-semibold text-gray-900 w-5 text-center text-xs">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-(--primary)"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <span className="font-bold text-(--primary) text-sm whitespace-nowrap mt-1">
                        {formatPrice(lineTotal, siteSettings)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Tip Section */}
              <div className="mt-5 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                  <Heart size={14} className="text-(--primary)" />
                  Add a Tip
                </p>
                <div className="flex flex-wrap gap-2">
                  {tipOptions.map((pct) => (
                    <button
                      key={pct}
                      onClick={() => {
                        setSelectedTip(selectedTip === pct ? null : pct);
                        setCustomTip("");
                      }}
                      className={`px-3.5 py-2 text-sm font-semibold rounded-lg border transition-all ${
                        selectedTip === pct && !customTip
                          ? "bg-(--primary) text-white border-(--primary) shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-(--primary) hover:text-(--primary)"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    min="0"
                    placeholder="Custom"
                    value={customTip}
                    onChange={(e) => {
                      setCustomTip(e.target.value);
                      if (e.target.value) setSelectedTip(null);
                    }}
                    className="w-20 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-(--primary)/30 focus:border-(--primary) transition-all"
                  />
                </div>
                {tipAmount > 0 && (
                  <p className="mt-2 text-xs text-gray-500">
                    Tip: {formatPrice(tipAmount, siteSettings)}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 my-5" />

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">
                    {formatPrice(subtotal, siteSettings)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                  <span className="font-semibold">
                    {formatPrice(tax, siteSettings)}
                  </span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {formatPrice(deliveryFee, siteSettings)}
                    </span>
                  </div>
                )}
                {tipAmount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tip</span>
                    <span className="font-semibold text-(--primary)">
                      {formatPrice(tipAmount, siteSettings)}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-(--primary) font-medium">
                    <span>Discount</span>
                    <span>-{formatPrice(discount, siteSettings)}</span>
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-(--primary) font-medium">
                    <span>Loyalty Points Reward</span>
                    <span>-{formatPrice(loyaltyDiscount, siteSettings)}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-lg font-bold text-(--text-primary)">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-(--primary)">
                    {formatPrice(total, siteSettings)}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                  {submitError}
                </div>
              )}

              {/* Continue to Payment Method */}
              <div className="mt-6 mb-6">
                <button
                  onClick={handleSubmitOrder}
                  disabled={!canCheckout}
                  className="w-full py-4 bg-primary text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-primary/20 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  <ShieldCheck size={20} />
                  {canCheckout ? "Proceed to Payment" : "Ordering Unavailable"}
                </button>
              </div>

              {/* Secure notice */}
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure checkout · SSL encrypted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
