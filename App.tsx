import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, Button, Alert} from 'react-native';

import Tts from 'react-native-tts';

import {Database} from './Sqlite';

const db = new Database();

export default function App() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [id, setId] = useState('');
  const [productId, setProductId] = useState('');
  const [searchResult, setSearchResult] = useState<string | null>(null);

  const handleCreateProduct = () => {
    const product = {
      id,
      name: name,
      price: Number(parseFloat(price).toFixed(2)),
    };

    if (isNaN(product.price)) {
      return Alert.alert('Invalid price! Please enter a valid number.');
    }

    try {
      db.insertProduct(product);
    } catch {
      return Alert.alert('Erro ao criar produto!');
    }

    setName('');
    setPrice('');
    setId('');
  };

  const handleSearchById = () => {
    try {
      db.findProductById(productId, product => {
        if (product) {
          setSearchResult(`Name: ${product.name}, Price: ${product.price}`);

          const splitedPrice = String(product.price).split('.');
          const fullPrice = splitedPrice[0];
          const cents = splitedPrice[1];
          const text = `${product.name} ${fullPrice} reais e ${cents} centavos`;

          Tts.stop();
          // pt-BR-SMTf00
          // pt-BR-default
          Tts.setDefaultVoice('pt-BR-default');
          Tts.speak(text);
        } else {
          setSearchResult('Product not found');
          Alert.alert('Produto não encontrado!');
        }
      });
    } catch {
      Alert.alert('Erro ao buscar produto!');
    }
  };

  useEffect(() => {
    db.initDatabase();
  }, []);

  return (
    <View style={{flex: 1, flexDirection: 'row', padding: 60}}>
      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text>Create Product</Text>
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={text => setName(text)}
        />
        <TextInput
          keyboardType="numbers-and-punctuation"
          placeholder="Price"
          value={price}
          onChangeText={text => setPrice(text)}
        />
        <TextInput
          onSubmitEditing={handleCreateProduct}
          enterKeyHint="done"
          keyboardType="number-pad"
          placeholder="Product Id"
          value={id}
          onChangeText={text => setId(text)}
        />
        <Button title="Create" onPress={handleCreateProduct} />
      </View>

      <View
        style={{
          flex: 1,
          padding: 20,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text>Search Product by ID</Text>
        <TextInput
          onSubmitEditing={handleSearchById}
          enterKeyHint="done"
          placeholder="Product ID"
          value={productId}
          onChangeText={text => setProductId(text)}
        />
        <Button title="Search" onPress={handleSearchById} />
        <Text>{searchResult}</Text>
      </View>
    </View>
  );
}
