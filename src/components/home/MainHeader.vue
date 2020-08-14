<template>
  <div class="section-header text-center my-8 py-2">
    <div class="text-uppercase caption mb-4 grey--text text--darken-2">
      Explora los datos
    </div>
    <h2 class="display-1 font-weight-light">
      Datos cívicos a tu alcance:<br>
      <b>Historia del presupuesto participativo</b>
    </h2>
      <v-divider class="mt-5 mb-4 mx-auto"></v-divider>
      <p class="text-subtitle-1 font-weight-light mx-auto px-3 text-justify">
        A través de esta página, Ollin, Jóvenes en Movimiento busca ofrecerte
        una herramienta de <b>transparencia</b>, para que conozcas los datos más
        relevantes de los proyectos ganadores de la consulta del Presupuesto
        Participativo en la Ciudad de México, a lo largo del tiempo. <br>
        Puedes consultar distintos indicadores que preparamos para que
        puedas explorar más acerca de este ejercicio ciudadano.<span v-if="false">
        puedes consultar distintos indicadores la descripción del proyecto, la variación entre el
        presupuesto aprobado y ejercido; la cantidad de votos emitidos y la
        cantidad de votos con la que ganó el proyecto triunfante en cada
        colonia, barrio, pueblo, así como la categoría de clasificación brindada
        tanto por el Instituto Electoral de la Ciudad de México, como por
        aquella elaborada por nuestra organización.</span>
      </p>
  </div>
</template>

<script>
  export default {
    //props: ['blok'],
  }
</script>

<style lang="sass">
  .section-header
    .v-divider
      border-width: 1px
      max-width: 50px
</style>
