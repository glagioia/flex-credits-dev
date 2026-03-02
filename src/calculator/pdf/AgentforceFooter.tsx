import React from 'react';
import { View, Text, StyleSheet, Image } from '@react-pdf/renderer';
import bomb from '../components/common/ui/Bomb.png';
import pinkStar from '../components/common/ui/pink_big_star.png';
import smallStar from '../components/common/ui/pink_small_star.png';

const styles = StyleSheet.create({
  // Capa base: Full width pegado al fondo
  footerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
    width: '100%',
  },
  // Contenedor con fondo y radio
  container: {
    backgroundColor: '#F0F7FF',
    borderTopLeftRadius: 24,
    paddingTop: 24,
    paddingBottom: 24,
    position: 'relative',
    minHeight: 110,
  },
  // Contenido con el margen izquierdo recuperado
  contentBox: {
    marginLeft: 32, // Ajusta este valor al margen de tu documento (ej. 32, 40)
    marginRight: 110, // Evita colisión con la mascota
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: '#002Ac0',
    marginBottom: 6,
  },
  body: {
    fontSize: 10,
    color: '#001E5B',
    fontWeight: 400,
    marginBottom: 10,
    maxWidth: 321,
    maxHeight: 37,
  },
  contactText: {
    fontSize: 10,
    fontWeight: 600,
    color: '#001E5B',
  },
  // Gráficos
  small_star: {
    position: 'absolute',
    top: 35,
    right: 60, // Ajustado para mantener proporción interna
    width: 11,
    height: 11,
  },
  big_star: {
    position: 'absolute',
    top: 45,
    right: 70, // Ajustado para mantener proporción interna
    width: 20,
    height: 20,
  },
  mascotWrapper: {
    position: 'absolute',
    right: 0, 
    bottom: 0,
    width: 85,
    height: 85,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  mascotImage: {
    width: 71,
    height: 71,
  },
  imagesWrapper: {
    position: 'absolute',
    right: 60, // Desplaza todo el conjunto 30px desde el borde derecho
    top: 0,
    bottom: 0,
    width: 110, // Define un ancho para contener star y mascot
  }
});

interface AgentforceFooterProps {
  bodyText?: string;
  style?: Record<string, unknown>;
}

export const AgentforceFooter: React.FC<AgentforceFooterProps> = ({ 
  bodyText = 'Get in touch with an expert Agentforce account executive to explore how Agentforce can help reach your goals.',
  style,
}) => (
  <View style={(style ? [styles.footerWrapper, style] : styles.footerWrapper) as React.ComponentProps<typeof View>['style']} fixed>
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <Text style={styles.title}>Ready to take the next step?</Text>
        <Text style={styles.body}>{bodyText}</Text>
        <Text style={styles.contactText}>Contact us 1-800-664-9073</Text>
      </View>

      <View style={styles.imagesWrapper}>
        <Image src={pinkStar} style={styles.big_star} />
        <Image src={smallStar} style={styles.small_star} />
        <View style={styles.mascotWrapper}>
          <Image src={bomb} style={styles.mascotImage} />
        </View>
      </View>   
    </View>
  </View>
);