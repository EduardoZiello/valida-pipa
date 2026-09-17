import { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export type QRCodeParaPdfRef = {
  gerarBase64: () => Promise<string>;
};

interface QRCodeParaPdfProps {
  valor: string;
}

const QRCodeParaPdf = forwardRef<QRCodeParaPdfRef, QRCodeParaPdfProps>(
  function QRCodeParaPdf({ valor }, ref) {
    const qrRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      gerarBase64: () =>
        new Promise((resolve, reject) => {
          if (!qrRef.current) {
            reject(new Error("QR Code ainda não está disponível."));
            return;
          }

          qrRef.current.toDataURL((data: string) => {
            if (!data) {
              reject(new Error("Não foi possível gerar a imagem do QR Code."));
              return;
            }

            resolve(`data:image/png;base64,${data}`);
          });
        }),
    }));

    return (
      <View style={styles.container}>
        <QRCode
          value={valor}
          size={300}
          backgroundColor="#FFFFFF"
          color="#000000"
          getRef={(ref) => {
            qrRef.current = ref;
          }}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: -1000,
    top: 0,
    width: 320,
    height: 320,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default QRCodeParaPdf;
