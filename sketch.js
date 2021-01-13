var dog, happyDog, dogIMG, sadDog, database, foodS, foodStock;
var feed,addFood;
var fedTime,lastFed;
var foodObj;
var gameState;
var changeState,readState;
var bedroom,garden,washroom;
var currentTime;

function preload()
{
  dogIMG = loadImage("Dog.png");
  happyDog = loadImage("happydog.png");
  bedroom = loadImage("Bed Room.png");
  garden = loadImage("Garden.png");
  washroom = loadImage("Wash Room.png");
  sadDog = loadImage("Lazy.png");
}

function setup(){
  createCanvas(500, 500);

  database=firebase.database();
  
  dog = createSprite(250,250,20,20);
  dog.addImage(dogIMG);
  dog.scale = 0.1;
  
  foodObj = new Food();

  foodStock=database.ref('Food');
  foodStock.on("value",readStock);

  readState=database.ref('gameState');
  readState.on("value",function(data){
    gameState=data.val();
  });

  feed=createButton("Feed the dog");
  feed.position(600,95);
  feed.mousePressed(feedDog);

  addFood=createButton("Add Food");
  addFood.position(700,95);
  addFood.mousePressed(addFoods);
}


function draw() {
  background(46,139,87);

  if(gameState!="Hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  }else{
    feed.show();
    addFood.show();
    dog.addImage(sadDog);
  }

  currentTime=hour();
  if(currentTime==(lastFed+1)){
    update("Playing");
    foodObj.garden();
  } else if(currentTime==(lastFed+2)){
    update("Sleeping");
    foodObj.bedroom();
  } else if(currentTime>(lastFed+2) && currentTime<=(lastFed+4)){
    update("Bathing");
    foodObj.washroom();
  }else{
    update("Hungry");
    foodObj.display();
  }

  drawSprites();

  textSize(15);
  fill("red");
  stroke("black")
  text("Food remaining:"+foodS,200,200);

  fedTime=database.ref('FeedTime');
  fedTime.on("value",function(data){
    lastFed=data.val();
  });

  fill(255,255,254);
  textSize(15);
  if(lastFed>=12){
    text("Last Feed : "+ lastFed%12 + " PM", 280,30);
  }else if(lastFed==0){
    text("Last Feed : 12 AM",280,30);
  }else{
    text("Last Feed : "+ lastFed + " AM",280,30);
  }
}

function readStock(data){
  foodS=data.val();
  foodObj.updateFoodStock(foodS);
}

function feedDog(){
  dog.addImage(happyDog);

  foodObj.updateFoodStock(foodObj.getFoodStock()-1);
  database.ref('/').update({
    Food:foodObj.getFoodStock(),
    FeedTime:hour()
  })
}

function addFoods(){
  foodS++;
  database.ref('/').update({
    Food:foodS
  })
}

function update(state){
  database.ref('/').update({
    gameState:state
  });
}


