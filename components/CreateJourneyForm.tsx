import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

export interface FormData {
  cityName: string;
  categoryNames: string[];
  from: number;
  to: number;
  price: number[];
}

interface CreateJourneyFormProps {
  onSubmit: (formData: FormData) => void;
  onClose?: () => void;
  initialData: FormData; // Accept initial data as a prop
}

const priceImages = [
  require("@/assets/images/price-0.png"),
  require("@/assets/images/price-1.png"),
  require("@/assets/images/price-2.png"),
  require("@/assets/images/price-3.png"),
];

const CustomCheckBox = ({
  isChecked,
  onChange,
  price,
}: {
  isChecked: boolean;
  onChange: () => void;
  price: number;
}) => {
  return (
    <TouchableOpacity onPress={onChange} style={styles.checkbox}>
      <Image
        source={priceImages[price]}
        style={[styles.checkboxImage, { opacity: isChecked ? 1 : 0.3 }]}
      />
    </TouchableOpacity>
  );
};

const CustomToggle = ({
  isChecked,
  onChange,
  label,
}: {
  isChecked: boolean;
  onChange: () => void;
  label: string;
}) => {
  return (
    <TouchableOpacity onPress={onChange} style={styles.toggleContainer}>
      <View style={[styles.toggle, isChecked && styles.toggleChecked]}>
        {isChecked && <View style={styles.toggleDot} />}
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const CustomMarker = ({ pressed }: { pressed: boolean }) => {
  return <View style={pressed ? styles.markerPressed : styles.marker}></View>;
};

const CreateJourneyForm = ({
  onSubmit,
  onClose,
  initialData,
}: CreateJourneyFormProps) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData.categoryNames
  );
  const [selectedPrices, setSelectedPrices] = useState<number[]>(
    initialData.price
  );
  const [fromTime, setFromTime] = useState(initialData.from);
  const [toTime, setToTime] = useState(initialData.to);
  const [isSliderActive, setIsSliderActive] = useState(false);

  const togglePriceSelection = (price: number) => {
    setSelectedPrices((prevPrices) =>
      prevPrices.includes(price)
        ? prevPrices.filter((p) => p !== price)
        : [...prevPrices, price]
    );
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId]
    );
  };

  const handleTimeValuesChange = (values: number[]) => {
    const [minTime, maxTime] = values;
    setFromTime(minTime);
    setToTime(maxTime);
  };

  const handleSubmit = () => {
    const fromTimeInt = Math.max(8, Math.min(23, fromTime));
    const toTimeInt = Math.max(8, Math.min(23, toTime));

    const categoryNames = selectedCategories.filter(
      (category) => category !== "Sleep"
    );

    onSubmit({
      cityName: "Paris",
      categoryNames,
      from: fromTimeInt,
      to: toTimeInt,
      price: selectedPrices,
    });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.modalTitle}>Create New Path</Text>
      <Text style={styles.sectionTitle}>Select Prices:</Text>
      <View style={styles.checkboxRow}>
        {[0, 1, 2, 3].map((price) => (
          <CustomCheckBox
            key={price}
            isChecked={selectedPrices.includes(price)}
            onChange={() => togglePriceSelection(price)}
            price={price}
          />
        ))}
      </View>
      <Text style={styles.sectionTitle}>Select Categories:</Text>
      <View style={styles.gridContainer}>
        {[
          "Drinks",
          "Culture",
          "Sports",
          "Festive",
          "Shopping",
          "Food",
          "Well-being",
        ].map((categoryName) => (
          <CustomToggle
            key={categoryName}
            isChecked={selectedCategories.includes(categoryName)}
            onChange={() => toggleCategorySelection(categoryName)}
            label={categoryName}
          />
        ))}
      </View>
      <Text style={styles.sectionTitle}>Select Time Range:</Text>
      <View style={styles.sliderContainer}>
        <MultiSlider
          values={[fromTime, toTime]}
          sliderLength={240}
          min={8}
          max={23}
          step={1}
          onValuesChange={handleTimeValuesChange}
          selectedStyle={{
            backgroundColor: isSliderActive ? "#007BFF" : "#777",
          }}
          unselectedStyle={{ backgroundColor: "lightgray" }}
          customMarker={CustomMarker}
          allowOverlap={false}
          snapped
          onValuesChangeStart={() => setIsSliderActive(true)}
          onValuesChangeFinish={() => setIsSliderActive(false)}
        />
      </View>
      <View style={styles.timeLabelsContainer}>
        <Text style={styles.timeLabel}>From: {fromTime}:00</Text>
        <Text style={styles.timeLabel}>To: {toTime}:00</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Create Path" onPress={handleSubmit} color={"#007BFF"} />
        {onClose && <Button title="Close" onPress={onClose} color="red" />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  checkbox: {
    marginHorizontal: 8,
  },
  checkboxImage: {
    width: 36,
    height: 36,
    padding: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "45%",
  },
  toggle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  toggleChecked: {
    backgroundColor: "#000",
  },
  toggleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  toggleLabel: {
    fontSize: 14,
  },
  sliderContainer: {
    alignItems: "center",
  },
  marker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    // Light gray color
    backgroundColor: "#D3D3D3",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  markerPressed: {
    height: 26,
    width: 26,
    borderRadius: 13,
    backgroundColor: "#007BFF",
    borderWidth: 2,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  timeLabelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeLabel: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default CreateJourneyForm;
