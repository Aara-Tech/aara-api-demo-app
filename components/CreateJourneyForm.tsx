import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";

const priceImages = [
  require("@/assets/images/price-0.png"),
  require("@/assets/images/price-1.png"),
  require("@/assets/images/price-2.png"),
  require("@/assets/images/price-3.png"),
];

const CustomCheckBox = ({ isChecked, onChange, price }) => {
  return (
    <TouchableOpacity onPress={onChange} style={styles.checkbox}>
      <Image
        source={priceImages[price]}
        style={[styles.checkboxImage, { opacity: isChecked ? 1 : 0.3 }]}
      />
    </TouchableOpacity>
  );
};

const CustomToggle = ({ isChecked, onChange, label }) => {
  return (
    <TouchableOpacity onPress={onChange} style={styles.toggleContainer}>
      <View style={[styles.toggle, isChecked && styles.toggleChecked]}>
        {isChecked && <View style={styles.toggleDot} />}
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

const CreateJourneyForm = ({
  onSubmit,
  onClose,
}: {
  onSubmit: (formData: any) => void;
  onClose?: () => void;
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState([]);
  const [fromTime, setFromTime] = useState("8");
  const [toTime, setToTime] = useState("23");

  const handleFromTimeChange = (text) => {
    if (text === "" || (parseInt(text) >= 0 && parseInt(text) <= 23)) {
      setFromTime(text);
    }
  };

  const handleToTimeChange = (text) => {
    if (text === "" || (parseInt(text) >= 0 && parseInt(text) <= 23)) {
      setToTime(text);
    }
  };

  const togglePriceSelection = (price) => {
    setSelectedPrices((prevPrices) =>
      prevPrices.includes(price)
        ? prevPrices.filter((p) => p !== price)
        : [...prevPrices, price]
    );
  };

  const toggleCategorySelection = (categoryId) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId]
    );
  };

  const handleSubmit = () => {
    const fromTimeInt = Math.max(8, Math.min(23, parseInt(fromTime) || 8));
    const toTimeInt = Math.max(8, Math.min(23, parseInt(toTime) || 23));

    const categoryNames = selectedCategories.filter(
      (category) => category !== "Sleep"
    );

    onSubmit({
      city: "Paris",
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
      <Text style={styles.sectionTitle}>From Time (8-23):</Text>
      <TextInput
        style={styles.input}
        value={fromTime}
        onChangeText={handleFromTimeChange}
        keyboardType="numeric"
        placeholder="8"
      />
      <Text style={styles.sectionTitle}>To Time (8-23):</Text>
      <TextInput
        style={styles.input}
        value={toTime}
        onChangeText={handleToTimeChange}
        keyboardType="numeric"
        placeholder="23"
      />
      <View style={styles.buttonContainer}>
        <Button title="Create Path" onPress={handleSubmit} />
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
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});

export default CreateJourneyForm;
