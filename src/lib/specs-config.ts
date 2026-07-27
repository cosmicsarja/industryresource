// Structured machine specification definitions per machine type / category
export interface SpecField {
  key: string;
  label: string;
  type: "number" | "text" | "select" | "checkbox";
  unit?: string;
  options?: string[];
  placeholder?: string;
}

export interface MachineSpecConfig {
  machineType: string;
  categorySlug?: string;
  fields: SpecField[];
}

export const MACHINE_SPECS_CONFIG: Record<string, SpecField[]> = {
  "CNC Lathe": [
    { key: "bed_length_mm", label: "Max Bed Length / Turning Length", type: "number", unit: "mm", placeholder: "e.g. 500" },
    { key: "turning_dia_mm", label: "Max Turning Diameter", type: "number", unit: "mm", placeholder: "e.g. 300" },
    { key: "spindle_speed_rpm", label: "Spindle Speed", type: "number", unit: "RPM", placeholder: "e.g. 4000" },
    { key: "control_system", label: "Control System", type: "select", options: ["Fanuc", "Siemens", "Heidenhain", "Mitsubishi", "Haas", "Other"] },
    { key: "material_compatibility", label: "Materials", type: "text", placeholder: "e.g. Mild Steel, Stainless Steel, Brass" },
  ],
  "VMC / Milling Machine": [
    { key: "x_travel_mm", label: "X-Axis Travel", type: "number", unit: "mm", placeholder: "e.g. 800" },
    { key: "y_travel_mm", label: "Y-Axis Travel", type: "number", unit: "mm", placeholder: "e.g. 500" },
    { key: "z_travel_mm", label: "Z-Axis Travel", type: "number", unit: "mm", placeholder: "e.g. 500" },
    { key: "table_size", label: "Table Size", type: "text", placeholder: "e.g. 1000x500 mm" },
    { key: "spindle_taper", label: "Spindle Taper", type: "select", options: ["BT40", "BT50", "CAT40", "HSK63A", "Other"] },
  ],
  "Hydraulic Press / Mechanical Press": [
    { key: "capacity_tons", label: "Capacity", type: "number", unit: "Tons", placeholder: "e.g. 100" },
    { key: "stroke_length_mm", label: "Stroke Length", type: "number", unit: "mm", placeholder: "e.g. 250" },
    { key: "daylight_mm", label: "Daylight Gap", type: "number", unit: "mm", placeholder: "e.g. 600" },
    { key: "platen_size", label: "Platen / Bed Size", type: "text", placeholder: "e.g. 800x600 mm" },
  ],
  "Laser / Plasma / Waterjet Cutting": [
    { key: "laser_power_watts", label: "Laser / Power Output", type: "number", unit: "Watts/kW", placeholder: "e.g. 3000" },
    { key: "bed_size", label: "Cutting Bed Dimensions", type: "text", placeholder: "e.g. 3000x1500 mm" },
    { key: "max_thickness_mm", label: "Max Cutting Thickness (MS)", type: "number", unit: "mm", placeholder: "e.g. 20" },
    { key: "material_compatibility", label: "Materials Handled", type: "text", placeholder: "e.g. MS, SS, Aluminum, Copper" },
  ],
  "Welding & Fabrication Equipment": [
    { key: "welding_process", label: "Welding Process", type: "select", options: ["TIG", "MIG/MAG", "Arc/SMAW", "Spot", "Submerged Arc", "Laser"] },
    { key: "current_rating_amps", label: "Max Current Rating", type: "number", unit: "Amps", placeholder: "e.g. 400" },
    { key: "duty_cycle_pct", label: "Duty Cycle", type: "number", unit: "%", placeholder: "e.g. 60" },
  ],
  "Conventional Lathe / Shaping": [
    { key: "center_height_mm", label: "Center Height", type: "number", unit: "mm", placeholder: "e.g. 250" },
    { key: "bed_length_mm", label: "Bed Length", type: "number", unit: "mm", placeholder: "e.g. 1500" },
    { key: "spindle_bore_mm", label: "Spindle Bore", type: "number", unit: "mm", placeholder: "e.g. 50" },
  ],
  "Generic Industrial Machine": [
    { key: "capacity_tons", label: "Capacity / Rating", type: "number", unit: "units", placeholder: "e.g. 50" },
    { key: "working_dimensions", label: "Working Dimensions", type: "text", placeholder: "e.g. 1000x800x500 mm" },
    { key: "power_hp", label: "Power", type: "number", unit: "HP", placeholder: "e.g. 10" },
    { key: "material_compatibility", label: "Material Compatibility", type: "text", placeholder: "e.g. Metals, Plastics, Wood" },
  ]
};

export const COMMON_MACHINE_TYPES = [
  "CNC Lathe",
  "VMC / Milling Machine",
  "Hydraulic Press / Mechanical Press",
  "Laser / Plasma / Waterjet Cutting",
  "Welding & Fabrication Equipment",
  "Conventional Lathe / Shaping",
  "Generic Industrial Machine"
];
