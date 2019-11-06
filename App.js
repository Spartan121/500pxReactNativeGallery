'use strict';
import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  TouchableHighlight,
} from 'react-native';
import Dimensions from 'Dimensions';

//отвечает за "качество" фото
const IMAGE_SIZE = 96;

//размеры миниатюры
var _h = (Dimensions.get('window').height)/2 - 100;
var _w = (Dimensions.get('window').width)/2-10;

//размерф фулскрина
var _hf = Dimensions.get('window').height;
var _wf = Dimensions.get('window').width;

//ссылка
var URL = function(page, imageSize = IMAGE_SIZE){
  return 'https://api.500px.com/v1/photos?feature=popular&image_size[]=' 
          +imageSize+
          '&page='
          +page;
}

class PhotoList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      navigation: this.props.navigation,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,}),
        loaded: false, //булевая загрузки
        loadingMore: false, //булевая доп загрузки при пролистывании
        imageOpened: false, //булевая открытия в полный экран
        fullImage: '',  //ссылка на фотку для полного экрана
		};
  }

  //обновление при запуске
	componentDidMount(){
		this._photos = []
		this.page = 1 //задается страница
		this.fetchPhotos(this.page);
  }
  
  //получение фоток
  fetchPhotos(page) {
    fetch(URL(page))
      .then((response) => response.json())
      .then((responseData) => {
        //вставка фоток
        var newPhotos = responseData.photos
        //добавление фоток
        this._photos = this._photos.concat(newPhotos)
        //увеличение страницы
        this.page +=1;
        this.setState({
          dataSource: 
          this.state.dataSource.cloneWithRows(this._photos),
          loaded: true,
        });
      })
			.catch(error =>
			    this.setState({
			    	message: 'Error: ' + error
			    }))
			.done();
  }
  
  render(){
    //проверка на состояние
    //показывает надпись, если фотки не загружены
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }
    //показывет фотку в большом размере, если она была выбрана
    //TODO: поскольку все в одном месте рендерится, добавить указатель фотки для прокручивания списка до этой фотки
    if (this.state.imageOpened) {
      return this.renderFullImage();
    }
    //показывает список фоток
    //TODO: косяк с обсолетом ListView, в идеале бы заменить на FlatList
    return (
      <ListView 
        contentContainerStyle={styles.list}
        initialListSize={10} //сколько фоток отрендерит сначала(лучше четное)
        dataSource = {this.state.dataSource}
        renderRow = {this.renderPhoto.bind(this)}
        scrollRenderAheadDistance={1500}
        onEndReached = {this._onEndReached.bind(this)}
        onEndReachedThreshold = {300}
        style = {styles.listView} />
    );  
  }
  
	_onEndReached() {
		console.log('End_Reached');

    //не грузить еще, если грузит уже
		if (this.state.loadingMore) {
			return;
		}

  this.setState({
    loadingMore: false
  });
  this.fetchPhotos(this.page);
  }
  
  //пустышка перед заполнением
  renderLoadingView() {
    return (
      <View>
        <Text style = {styles.loadingText}>
          Загрузка...
        </Text>
      </View>
    )
  }

  //фото для списка фото
  renderPhoto(photo) {
    return (
      <TouchableHighlight onPress ={() => this.OpenImage(photo.image_url[0]) } underlayColor = '#edf5f9'>
        <View>
          <Image 
            source = {{uri: photo.image_url[0]}}
            style = {styles.tumbnail} />
        </View>
      </TouchableHighlight>
    )
  }

  //открытие фулскрин фото
  //магия с функцией вместо отдельного экрана
  renderFullImage(){
    return (
        <TouchableHighlight onPress ={() => this.CloseImage()}>
          <View style = {styles.container}>
            <Image 
              style = {styles.image}
              source = {{uri: this.state.fullImage}} />
          </View>
        </TouchableHighlight>
      );
    }

  //переключение открытия фото
  OpenImage(imageId) {
    this.setState({
      imageOpened: true,  //булевая открытия фотки
      fullImage: imageId, //ссылка на фото
    })
  }

  CloseImage() {
    this.setState({
      imageOpened: false,
    })
  }
}


//убранный костыль с переходами
//export default createAppContainer(AppNavigator);

const styles = StyleSheet.create({
	list : {
		justifyContent: 'space-around',
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	tumbnail : {
		width: _w,
		height: _h,
		margin: 5
	},
	listView: {
		flex: 2,
		paddingTop: 8,
		backgroundColor: '#edf5f9'
	},
  loadingText: {
    marginTop: 240,
    fontSize: 20,
    textAlign: 'center',
  },
  container: { 
    flex: 1 
  },
  image: {
    width: _wf,
    height: _hf
  },
});

module.exports = PhotoList;