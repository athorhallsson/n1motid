<template>
  <div class="main">
    <div id="logocontainer">
      <img id="logo" src="../assets/logo_white.png">
      <span class="studios">
        <el-select v-model="studio" @change="switchStudio" placeholder="Studio">
          <el-option v-for="s in studios" :key="s" :label="'Stúdíó ' + s" :value="s"></el-option>
        </el-select>
      </span>
      <span class="pagination">
        <el-pagination @current-change="getPhotos" :current-page.sync="page" :page-size="30" layout="prev, pager, next" :total="totalItems"></el-pagination>
      </span>
    </div>
    <el-dialog fullscreen="true" v-model="dialogVisible" size="large" top="0vh" close-on-click-modal="false" width="100%" :title="selectedImage.name">
      <img class="selimage" :src="selectedImage.url" v-bind:class="{ bw: selectedImage.blackAndWhite }" alt="">
      <div>
        <i v-if="this.selectedImageIndex > 0" class="el-icon-arrow-left" @keyup='handleKeyup' v-on:click="decreaseDisplayImage" /> 
        <i class="el-icon-plus" v-on:click="addToCart(selectedImage)"></i>
        <i v-if="this.selectedImageIndex < this.images.length - 1" class="el-icon-arrow-right" v-on:click="increaseDisplayImage" />
      </div>
    </el-dialog>
    <el-dialog v-model="cartDialogVisible" size="large" top="2vh" @title="selectedCartImage.name">
      <img class="selimage" :src="selectedCartImage.thumb" v-bind:class="{ bw: selectedCartImage.blackAndWhite }" alt="">
    </el-dialog>
    <div class="photocontainer">
      <div id="photos" v-loading="loading">
        <p><i class="el-icon-star-off"></i>Veldu þær myndir sem þú vilt panta. Stærðin er 15x20 cm.<i class="el-icon-star-off"></i></p>
        <ul id="photolist">
          <li v-for="image in images" :key="image.id">
            <div>
              <img :src="image.thumb" v-on:click="showImage(image)"/>
              <p>{{image.name}} <i class="el-icon-plus" v-on:click="addToCart(image)"></i> </p>
            </div>
          </li>
        </ul>
      </div>
      <div class="cart">
        <span class="cartdesc">
            <h2>Karfa</h2>
            <h3>Verð: {{totalPrice}} kr.</h3>
            <div><el-button :loading="loading" :disabled="loading" size="medium" type="danger" @click="dialogFormVisible = true">Panta</el-button></div>
        </span>
        <span v-for="item in cart" :key="item.id" class="cartitem">
            <div>
              <i class="el-icon-close remove" v-on:click="removeFromCart(item)"></i>
              <img :src="item.thumb"  v-on:click="showCartImage(item)" v-bind:class="{ bw: item.blackAndWhite }" />
            </div>
            <el-switch v-model="item.blackAndWhite" on-color="red" on-text="BW" off-text=""></el-switch>
            <el-input-number v-model="item.count" size="small" controls-position="right" :min="1" :max="100"></el-input-number>
        </span>
      </div>
    </div>
    <el-dialog title="Pöntunarupplýsingar" custom-class="orderdialog" :visible.sync="dialogFormVisible" top="2vh" >
      <el-form>
        <el-form-item label="Nafn">
          <el-input v-model="order.customerName" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Kennitala">
          <el-input v-model="order.ssn" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Sími">
          <el-input v-model="order.phone" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Netfang">
          <el-input v-model="order.email" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="Athugasemd">
          <el-input v-model="order.information" type="textarea" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogFormVisible = false">Hætta við</el-button>
        <el-button type="danger" @click="sendOrder()">Senda pöntun</el-button>
      </span>
    </el-dialog>
    <el-dialog custom-class="initialdialog" :visible.sync="initialDialog">
      <h2>Árshátíð MA 2022</h2>
      <p>Hérna geturu pantað myndir frá Árshátíð MA 2022 eða hlaðið þeim niður með því að opna mynd, hægri smella og velja Save (eða draga í möppu).</p>
      <p>Myndirnar eru settar í körfuna með því að smella á +. Stærðin á myndunum er 15x20 cm og verðið er 500 kr./stk. Þar er hægt að velja um svarthvítt eða lit.</p>
      <p>Látið er vita með SMS skilaboðum þegar pöntun er tilbúin til afhendingar í Pedromyndum Skipagötu 16.</p>
      <i class="el-icon-information info"></i>
    </el-dialog>
  </div>
</template>

<script>
const BASE_URL = process.env.API_URL
export default {
  name: 'main',
  data () {
    return {
      order: {
        customerName: '',
        ssn: '',
        phone: '',
        email: '',
        information: ''
      },
      images: [],
      loading: true,
      page: 1,
      totalPages: 0,
      cart: [],
      dialogVisible: false,
      dialogFormVisible: false,
      studios: [ 'A', 'B', 'C' ],
      studio: 'A',
      initialDialog: true,
      cartDialogVisible: false,
      selectedCartImage: {},
      selectedImageIndex: -1
    }
  },
  computed: {
    pages: function () {
      var pages = []
      for (var i = 1; i <= this.totalPages; i++) {
        pages.push(i)
      }
      return pages
    },
    totalItems: function () {
      return this.totalPages * 30
    },
    totalPrice: function () {
      var total = 0
      for (var i = 0; i < this.cart.length; i++) {
        total = total + (500 * this.cart[i].count)
      }
      return total
    },
    selectedImage: function () {
      if (this.selectedImageIndex >= 0 && this.selectedImageIndex < this.images.length) {
        return this.images[this.selectedImageIndex]
      }
      return {}
    }
  },
  methods: {
    switchStudio () {
      this.page = 1
      this.getPhotos()
    },
    showImage (image) {
      this.selectedImageIndex = this.images.indexOf(image)
      this.dialogVisible = true
    },
    showCartImage (image) {
      this.selectedCartImage = image
      this.cartDialogVisible = true
    },
    goToPage (page) {
      this.page = page
      this.getPhotos()
    },
    getPhotos () {
      this.loading = true
      return this.$http.get(BASE_URL + '/api/v1/ma/photos?page=' + (this.page - 1) + '&studio=' + this.studio)
        .then((response) => {
          this.images = response.body.images
          console.log(response)
          this.totalPages = response.body.totalPages
          this.loading = false
        })
        .catch((errorResponse) => {
          console.log(errorResponse)
          this.$message.error('Gat ekki sótt myndir')
          this.loading = false
        })
    },
    showError (message) {
      this.$message.error(message)
    },
    sendOrder () {
      if (!this.cart.length) {
        this.$message.error('Engin mynd í körfunni')
        return
      }
      if (!this.order.customerName) {
        this.$message.error('Nafn er nauðsynlegt')
        return
      }
      if (this.order.ssn.length !== 10) {
        this.$message.error('Kennitala ógild')
        return
      }
      if (this.order.phone.length !== 7) {
        this.$message.error('Ógilt símanúmer')
        return
      }
      if (this.order.email.indexOf('@') === -1) {
        this.$message.error('Netfang ógilt')
        return
      }
      this.loading = true
      var req = this.order
      req.items = this.cart
      return this.$http.post(BASE_URL + '/api/v1/ma/orders', req)
        .then((response) => {
          this.cart = []
          console.log(response)
          this.dialogFormVisible = false
          this.$message.success('Pöntun send')
          this.loading = false
        })
        .catch((errorResponse) => {
          console.log(errorResponse)
          this.$message.error('Gat ekki sótt myndir')
          this.loading = false
        })
    },
    addToCart (image) {
      this.cart.push({ photoId: image.id, thumb: image.thumb, count: 1, blackAndWhite: false })
    },
    removeFromCart (image) {
      var index = this.cart.indexOf(image)
      if (index > -1) {
        this.cart.splice(index, 1)
      }
    },
    decreaseDisplayImage () {
      if (this.selectedImageIndex < 1) {
        return
      }
      this.selectedImageIndex = this.selectedImageIndex - 1
    },
    increaseDisplayImage () {
      if (this.selectedImageIndex >= this.images.length - 1) {
        return
      }
      this.selectedImageIndex = this.selectedImageIndex + 1
    },
    handleKeyup (event) {
      if (event.keyCode === 37) {
        this.decreaseDisplayImage()
      } else if (event.keyCode === 39) {
        this.increaseDisplayImage()
      }
    }
  },
  mounted () {
    document.addEventListener('keyup', this.handleKeyup)
    this.getPhotos()
  }
}
</script>

<style scoped>

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 0;
}

p {
  font-size: 18px;
  line-height: 2em;
}

#photos {
  padding: 5px;
  width: 100%;
  background-color: white;
}

#photos img {
  display: block;
  max-width: 450px;
  margin: 5px;
  width: 90%;
  margin-bottom: 15px;
}

#photos div {
  padding-bottom: 15px;
  padding-top: 10px;
}

#photos ul li p {
  color: black;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.1em;
}

#photos i {
  padding: 5px;
}

em {
  line-height: 3.5em;
}

#photos {
    height: 65vh;
    overflow-y: scroll;
}

.photocontainer {
  height: 50%;
}

.el-dialog__header .el-dialog__body {
  width: 500px;
}

.el-dialog__body {
  padding: 5px;
  height: 600px;
}

/* Cart */

.cart {
  height: 180px;
  width: 100%;
  color: white;
  padding: 10px 10px;
  background-color: rgb(40, 50, 45);
  overflow: scroll;
}

.cart img {
  display: inline;
  max-width: 100px;
  max-height: 100px;
  margin: 5px;
  width: 90%;
}

/* .cart span > div {
  display: inline;
} */

.cartdesc {
  float: left;
  margin-right: 30px;
  border-right-color: white-space;
  border-right-style: solid;
  border-right-width: 1px;
  padding-right: 30px;
  padding-top: 10px;
}

.cartdesc h2 {
  font-weight: 500;
  padding: 1px;
  margin: 1px;
  width: 150px;
}

.cartdesc h3 {
  margin: 5px;
  padding: 5px;
}

.cartitem {
  float: left;
  margin-top: -5px;
  padding-top: 1px;
  padding-bottom: 5px;
  margin-bottom: 5px;
  margin-right: 10px;
}

.remove {
  float: right;
  font-size: 10px;
}

.main {
  height: 100vh;
  width: 100%;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
}

/* Header */

#logocontainer {
  background-color: rgb(40, 50, 45);
  padding: 20px;
  height: 5vh;
}

#logo {
    max-width: 250px;
    width: 80%;
    margin-top: 0px;
    margin-bottom: 0px;
    padding-bottom: 0px;
    float: left;
}

.pages {
  float: right;
  padding: 10px;
  margin-top: 15px;
  height: 25px;
}

.pagenumber {
  cursor: pointer;
  padding: 10px;
  margin-top: 10px;
  font-size: 18px;
  font-weight: 500;
  border-color: black;
  border-width: 1px;
  color: white;
}

.underline {
  text-decoration: underline;
}

.pagenumber:hover {
  color: red;
  text-decoration: underline;
}

img.bw {
	filter: grayscale(1);
}

.el-input {
    margin-right: 5px;
    padding-right: 5px;
}

i {
  font-size: 20px;
  padding: 4px;
}

.info {
    font-size: 36px;
}

.pagination {
    margin-top: 15px;
    margin-bottom: 15px;
    margin-left: 15px;
    float: right;
    z-index: 100;
}

.studios {
    position:block;
    left:0;
    right:0;
    margin-left:auto;
    margin-right:auto;
    margin-top: 12px;
    width: 300px;
}

.orderdialog {
    padding: 25px;
}

.orderdialog .el-form {
    width: 90%;
    margin: auto;
}

.selimage {
    max-width: 600px;
    max-height: 600px;
}

</style>
