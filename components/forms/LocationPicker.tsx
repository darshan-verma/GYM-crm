"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { useLoadScript } from "@react-google-maps/api";

const libraries: ("places" | "drawing" | "geometry")[] = ["places"];

interface LocationPickerProps {
	onLocationChange: (location: {
		address: string;
		formattedAddress: string;
		latitude: number;
		longitude: number;
		city?: string;
		state?: string;
		pincode?: string;
	} | null) => void;
	initialLocation?: {
		formattedAddress?: string;
		latitude?: number;
		longitude?: number;
	};
	disabled?: boolean;
}

export default function LocationPicker({
	onLocationChange,
	initialLocation,
	disabled = false,
}: LocationPickerProps) {
	const [address, setAddress] = useState(initialLocation?.formattedAddress || "");
	const [selectedLocation, setSelectedLocation] = useState<{
		address: string;
		formattedAddress: string;
		latitude: number;
		longitude: number;
		city?: string;
		state?: string;
		pincode?: string;
	} | null>(
		initialLocation?.latitude && initialLocation?.longitude
			? {
					address: initialLocation.formattedAddress || "",
					formattedAddress: initialLocation.formattedAddress || "",
					latitude: initialLocation.latitude,
					longitude: initialLocation.longitude,
			  }
			: null
	);
	const [showMap, setShowMap] = useState(false);
	const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(
		initialLocation?.latitude && initialLocation?.longitude
			? { lat: initialLocation.latitude, lng: initialLocation.longitude }
			: null
	);

	const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
	const mapRef = useRef<google.maps.Map | null>(null);
	const markerRef = useRef<google.maps.Marker | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: apiKey,
		libraries,
		// Don't use version: "weekly" as it routes to new platform requiring Places API (New)
		// Using default version supports legacy Places API
	});

	useEffect(() => {
		if (isLoaded && inputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
			try {
				autocompleteRef.current = new google.maps.places.Autocomplete(
					inputRef.current,
					{
						types: ["address"],
						componentRestrictions: { country: "in" }, // Restrict to India, remove if you want global
						fields: ["formatted_address", "geometry", "address_components"], // Request specific fields
					}
				);
			} catch (error) {
				console.error("Error initializing Autocomplete:", error);
				return;
			}

			autocompleteRef.current.addListener("place_changed", () => {
				const place = autocompleteRef.current?.getPlace();
				if (place && place.geometry && place.geometry.location) {
					const location = place.geometry.location;
					// Google Maps LatLng object has lat() and lng() methods
					const lat = location.lat();
					const lng = location.lng();
					const formattedAddress = place.formatted_address || "";

					// Extract address components
					let city = "";
					let state = "";
					let pincode = "";

					if (place.address_components) {
						place.address_components.forEach((component) => {
							const types = component.types;
							if (types.includes("locality") || types.includes("sublocality")) {
								city = component.long_name;
							}
							if (types.includes("administrative_area_level_1")) {
								state = component.long_name;
							}
							if (types.includes("postal_code")) {
								pincode = component.long_name;
							}
						});
					}

					const locationData = {
						address: formattedAddress,
						formattedAddress,
						latitude: lat,
						longitude: lng,
						city: city || undefined,
						state: state || undefined,
						pincode: pincode || undefined,
					};

					setSelectedLocation(locationData);
					setAddress(formattedAddress);
					setMapCenter({ lat, lng });
					setShowMap(true);
					onLocationChange(locationData);
				}
			});
		}
	}, [isLoaded, onLocationChange]);

	// Initialize map when shown
	useEffect(() => {
		if (!showMap || !mapCenter || !isLoaded) {
			return;
		}

		// Wait for DOM element to be available
		const timer = setTimeout(() => {
			const mapElement = document.getElementById("map");
			if (!mapElement) return;

			// Initialize map if it doesn't exist
			if (!mapRef.current) {
				mapRef.current = new google.maps.Map(mapElement, {
					center: mapCenter,
					zoom: 15,
					mapTypeControl: false,
					fullscreenControl: false,
					streetViewControl: false,
				});

				// Create marker if it doesn't exist
				if (!markerRef.current) {
					markerRef.current = new google.maps.Marker({
						position: mapCenter,
						map: mapRef.current,
						draggable: true,
						animation: google.maps.Animation.DROP,
					});

					// Add drag listener only once when marker is created
					markerRef.current.addListener("dragend", () => {
						if (markerRef.current) {
							const position = markerRef.current.getPosition();
							if (position) {
								const lat = position.lat();
								const lng = position.lng();

								// Reverse geocode to get address
								const geocoder = new google.maps.Geocoder();
								geocoder.geocode({ location: { lat, lng } }, (results, status) => {
									if (status === "OK" && results && results[0]) {
										const formattedAddress = results[0].formatted_address;

										// Extract address components
										let city = "";
										let state = "";
										let pincode = "";

										results[0].address_components.forEach((component) => {
											const types = component.types;
											if (
												types.includes("locality") ||
												types.includes("sublocality")
											) {
												city = component.long_name;
											}
											if (types.includes("administrative_area_level_1")) {
												state = component.long_name;
											}
											if (types.includes("postal_code")) {
												pincode = component.long_name;
											}
										});

										const locationData = {
											address: formattedAddress,
											formattedAddress,
											latitude: lat,
											longitude: lng,
											city: city || undefined,
											state: state || undefined,
											pincode: pincode || undefined,
										};

										setSelectedLocation(locationData);
										setAddress(formattedAddress);
										onLocationChange(locationData);
									}
								});
							}
						}
					});
				} else {
					// Reuse existing marker
					markerRef.current.setPosition(mapCenter);
					markerRef.current.setMap(mapRef.current);
				}
			} else {
				// Map already exists, update center and trigger resize
				mapRef.current.setCenter(mapCenter);
				if (markerRef.current) {
					markerRef.current.setPosition(mapCenter);
					markerRef.current.setMap(mapRef.current);
				}
				// Trigger resize to fix rendering after being hidden
				setTimeout(() => {
					if (mapRef.current) {
						google.maps.event.trigger(mapRef.current, "resize");
					}
				}, 100);
			}
		}, 100);

		return () => clearTimeout(timer);
	}, [showMap, mapCenter, isLoaded, onLocationChange]);

	const handleMapClick = useCallback(
		(event: google.maps.MapMouseEvent) => {
			if (event.latLng && mapRef.current) {
				const lat = event.latLng.lat();
				const lng = event.latLng.lng();

				// Update marker position
				if (markerRef.current) {
					markerRef.current.setPosition({ lat, lng });
				} else {
					markerRef.current = new google.maps.Marker({
						position: { lat, lng },
						map: mapRef.current,
						draggable: true,
						animation: google.maps.Animation.DROP,
					});

					markerRef.current.addListener("dragend", () => {
						if (markerRef.current) {
							const position = markerRef.current.getPosition();
							if (position) {
								const lat = position.lat();
								const lng = position.lng();

								const geocoder = new google.maps.Geocoder();
								geocoder.geocode({ location: { lat, lng } }, (results, status) => {
									if (status === "OK" && results && results[0]) {
										const formattedAddress = results[0].formatted_address;

										let city = "";
										let state = "";
										let pincode = "";

										results[0].address_components.forEach((component) => {
											const types = component.types;
											if (
												types.includes("locality") ||
												types.includes("sublocality")
											) {
												city = component.long_name;
											}
											if (types.includes("administrative_area_level_1")) {
												state = component.long_name;
											}
											if (types.includes("postal_code")) {
												pincode = component.long_name;
											}
										});

										const locationData = {
											address: formattedAddress,
											formattedAddress,
											latitude: lat,
											longitude: lng,
											city: city || undefined,
											state: state || undefined,
											pincode: pincode || undefined,
										};

										setSelectedLocation(locationData);
										setAddress(formattedAddress);
										onLocationChange(locationData);
									}
								});
							}
						}
					});
				}

				// Reverse geocode
				const geocoder = new google.maps.Geocoder();
				geocoder.geocode({ location: { lat, lng } }, (results, status) => {
					if (status === "OK" && results && results[0]) {
						const formattedAddress = results[0].formatted_address;

						let city = "";
						let state = "";
						let pincode = "";

						results[0].address_components.forEach((component) => {
							const types = component.types;
							if (
								types.includes("locality") ||
								types.includes("sublocality")
							) {
								city = component.long_name;
							}
							if (types.includes("administrative_area_level_1")) {
								state = component.long_name;
							}
							if (types.includes("postal_code")) {
								pincode = component.long_name;
							}
						});

						const locationData = {
							address: formattedAddress,
							formattedAddress,
							latitude: lat,
							longitude: lng,
							city: city || undefined,
							state: state || undefined,
							pincode: pincode || undefined,
						};

						setSelectedLocation(locationData);
						setAddress(formattedAddress);
						onLocationChange(locationData);
					}
				});
			}
		},
		[onLocationChange]
	);

	useEffect(() => {
		if (mapRef.current) {
			mapRef.current.addListener("click", handleMapClick);
		}
		return () => {
			if (mapRef.current) {
				google.maps.event.clearListeners(mapRef.current, "click");
			}
		};
	}, [handleMapClick]);

	const handleClearLocation = () => {
		setAddress("");
		setSelectedLocation(null);
		setShowMap(false);
		setMapCenter(null);
		if (markerRef.current) {
			markerRef.current.setMap(null);
			markerRef.current = null;
		}
		onLocationChange(null);
		if (inputRef.current) {
			inputRef.current.value = "";
		}
	};

	if (!apiKey) {
		return (
			<div className="space-y-2">
				<Label>Location (Optional)</Label>
				<div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
					Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
				</div>
			</div>
		);
	}

	if (loadError) {
		const isLegacyError = loadError.message?.includes("legacy") || loadError.message?.includes("LegacyApiNotActivated");
		
		return (
			<div className="space-y-2">
				<Label>Location (Optional)</Label>
				<div className="text-sm text-red-500 p-3 bg-red-50 rounded-md space-y-2">
					<div className="font-semibold">Error loading Google Maps</div>
					{isLegacyError ? (
						<div className="text-xs space-y-2">
							<div className="font-semibold">Legacy Places API Not Enabled</div>
							<div>You need to enable the <strong>legacy Places API</strong> (not just "Places API (New)"):</div>
							<ol className="list-decimal list-inside mt-1 space-y-1 ml-2">
								<li>Go to Google Cloud Console → APIs & Services → Library</li>
								<li>Search for "Places API" (without "New")</li>
								<li>Enable the <strong>legacy Places API</strong></li>
								<li>Go to Credentials → Your API Key → API restrictions</li>
								<li>Add "Places API" to the allowed APIs list</li>
								<li>Wait 5-10 minutes, then restart your dev server</li>
							</ol>
							<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
								<strong>Note:</strong> Both "Places API" (legacy) and "Places API (New)" can be enabled at the same time. The Autocomplete widget requires the legacy version.
							</div>
						</div>
					) : (
						<div className="text-xs">
							Please ensure:
							<ul className="list-disc list-inside mt-1 space-y-1">
								<li>Maps JavaScript API is enabled</li>
								<li>Places API (legacy) is enabled</li>
								<li>Geocoding API is enabled</li>
								<li>Billing is enabled for your Google Cloud project</li>
								<li>API key restrictions allow your domain</li>
							</ul>
						</div>
					)}
					{loadError.message && (
						<div className="text-xs mt-2 font-mono bg-red-100 p-2 rounded">
							{loadError.message}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (!isLoaded) {
		return (
			<div className="space-y-2">
				<Label>Location (Optional)</Label>
				<Input
					ref={inputRef}
					placeholder="Loading Google Maps..."
					disabled
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<Label htmlFor="location">Location (Optional)</Label>
					{selectedLocation && (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleClearLocation}
							disabled={disabled}
							className="h-8 text-xs"
						>
							<X className="h-3 w-3 mr-1" />
							Clear
						</Button>
					)}
				</div>
				<div className="relative">
					<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						id="location"
						ref={inputRef}
						type="text"
						value={address}
						onChange={(e) => setAddress(e.target.value)}
						placeholder="Type address to search..."
						disabled={disabled}
						className="pl-10"
					/>
				</div>
				<p className="text-xs text-muted-foreground">
					Start typing an address and select from suggestions, or click on the map
					to pin a location
				</p>
			</div>

			{selectedLocation && (
				<div className="space-y-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => setShowMap(!showMap)}
						disabled={disabled}
						className="w-full"
					>
						{showMap ? "Hide Map" : "Show Map"}
					</Button>

					{showMap && (
						<div className="border rounded-lg overflow-hidden">
							<div
								id="map"
								style={{ height: "400px", width: "100%" }}
								className="w-full"
							/>
						</div>
					)}

					{selectedLocation.formattedAddress && (
						<div className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
							<strong>Selected:</strong> {selectedLocation.formattedAddress}
							{selectedLocation.city && (
								<>
									<br />
									<strong>City:</strong> {selectedLocation.city}
								</>
							)}
							{selectedLocation.state && (
								<>
									<br />
									<strong>State:</strong> {selectedLocation.state}
								</>
							)}
							{selectedLocation.pincode && (
								<>
									<br />
									<strong>Pincode:</strong> {selectedLocation.pincode}
								</>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
