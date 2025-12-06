import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useStore, CartItem } from '../store/useStore';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

const CartScreen = () => {
    const { cart, removeFromCart } = useStore();

    const generatePDF = async () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Add items first');
            return;
        }

        try {
            let rows = cart.map(item => `
        <tr>
          <td>${item.product.productName}</td>
          <td>${item.selection}</td>
        </tr>
      `).join('');

            const html = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              h1 { text-align: center; }
            </style>
          </head>
          <body>
            <h1>Order Summary</h1>
            <table>
              <tr><th>Product Name</th><th>Quantity / Note</th></tr>
              ${rows}
            </table>
          </body>
        </html>
      `;

            const options = {
                html,
                fileName: 'Order_Summary',
                base64: true,
            };

            const file = await RNHTMLtoPDF.convert(options);

            const shareOptions = {
                title: 'Share Order (PDF)',
                url: `file://${file.filePath}`,
                type: 'application/pdf',
                message: 'Here is my order (PDF)',
                social: Share.Social.WHATSAPP,
                whatsAppNumber: '',
                failOnCancel: false,
            } as any;

            try {
                await Share.shareSingle(shareOptions);
            } catch (err) {
                console.log("WhatsApp share failed, trying open", err);
                await Share.open({
                    url: `file://${file.filePath}`,
                    type: 'application/pdf',
                    message: 'Here is my order (PDF)',
                });
            }

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate specific PDF share');
        }
    };

    const shareText = async () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Add items first');
            return;
        }

        let message = "*Order Summary*\n\n";
        cart.forEach(item => {
            message += `*${item.product.productName}*\n`;
            message += `> ${item.selection}\n\n`;
        });

        try {
            const shareOptions = {
                title: 'Share Order (Text)',
                message: message,
                social: Share.Social.WHATSAPP,
                whatsAppNumber: '',
                failOnCancel: false,
            } as any;

            try {
                await Share.shareSingle(shareOptions);
            } catch (err) {
                await Share.open({
                    message: message,
                    title: 'Order Summary'
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const renderItem = ({ item }: { item: CartItem }) => (
        <View style={styles.item}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.product.productName}</Text>
                <Text style={[styles.sel, item.selection.startsWith('Note:') ? { color: '#e67e22', fontStyle: 'italic' } : {}]}>
                    {item.selection}
                </Text>
            </View>
            <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.remove}>
                <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Your Cart ({cart.length})</Text>
            <FlatList
                data={cart}
                keyExtractor={i => i.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 10 }}
            />

            <View style={styles.footer}>
                <TouchableOpacity style={[styles.shareBtn, { marginBottom: 10, backgroundColor: '#3498db' }]} onPress={generatePDF}>
                    <Text style={styles.shareText}>Share PDF</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareBtn} onPress={shareText}>
                    <Text style={styles.shareText}>Share Text (WhatsApp)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: { fontSize: 24, fontWeight: 'bold', padding: 20, backgroundColor: '#fff' },
    item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8 },
    name: { fontSize: 14, color: '#333', fontWeight: 'bold' },
    sel: { marginTop: 4, fontSize: 13, color: '#007bff' },
    remove: { padding: 5, marginLeft: 10 },
    removeText: { color: 'red', fontSize: 12 },
    footer: { padding: 20, backgroundColor: '#fff', elevation: 10 },
    shareBtn: { backgroundColor: '#25D366', padding: 15, borderRadius: 8, alignItems: 'center' },
    shareText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default CartScreen;
