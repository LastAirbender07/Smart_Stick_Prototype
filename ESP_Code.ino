#define BLYNK_TEMPLATE_ID " XXXXXXXX "
#define BLYNK_TEMPLATE_NAME "IOTProject"
#define BLYNK_AUTH_TOKEN " XXXXXXXX "

#define BLYNK_PRINT Serial

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <ThingSpeak.h>

char auth[] = BLYNK_AUTH_TOKEN;
char ssid[] = "Wifi-name";
char pass[] = "wifi-pass";
WiFiClient  client;

unsigned long myChannelField = 1234567;
const int ChannelField = 1;
const char * myWriteAPIKey = " XXXXXXXX ";


#define button1_pin 5
#define relay1_pin 9
int relay1_state = 0;
#define button1_vpin    V1

const int TRIG_PIN   = 3; 
const int ECHO_PIN   = 2; 
const int BUZZER_PIN = 10; 
const int DISTANCE_THRESHOLD = 18; 

float duration, distance;
BlynkTimer timer;

BLYNK_CONNECTED() {
  Blynk.syncVirtual(button1_vpin);
}

BLYNK_WRITE(button1_vpin) {
  relay1_state = param.asInt();
  digitalWrite(relay1_pin, relay1_state);
}


void setup()
{
  Serial.begin(115200);
  pinMode(button1_pin, INPUT_PULLUP);
  pinMode(relay1_pin, OUTPUT);
  digitalWrite(relay1_pin, HIGH);

  pinMode(TRIG_PIN, OUTPUT);  
  pinMode(ECHO_PIN, INPUT);  
  pinMode(BUZZER_PIN, OUTPUT); 
  Blynk.begin(auth, ssid, pass);
  WiFi.mode(WIFI_STA);
  ThingSpeak.begin(client);
}

unsigned long previousMillis = 0;
const long interval = 2000; 

void loop()
{
  if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Attempting to connect to SSID: ");
    Serial.println(ssid);
    while (WiFi.status() != WL_CONNECTED)
    {
      WiFi.begin(ssid, pass);
      Serial.print(".");
      delay(5000);
    }
    Serial.println("\nConnected.");
  }

    unsigned long currentMillis = millis();
    Blynk.run();
    timer.run();

    if (currentMillis - previousMillis >= interval) {
        previousMillis = currentMillis;
        ultra();
    }
  listen_push_buttons();
}

void listen_push_buttons(){
    if(digitalRead(button1_pin) == LOW){
      delay(200);
      control_relay(1);
      Blynk.virtualWrite(button1_vpin, relay1_state);
    }
}

void control_relay(int relay){
  if(relay == 1){
    relay1_state = !relay1_state;
    digitalWrite(relay1_pin, relay1_state);
    Serial.print("Relay1 State = ");
    Serial.println(relay1_state);
    delay(50);
  }
}

void ultra(){
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  duration = pulseIn(ECHO_PIN, HIGH);
  distance = (0.034 * duration)/2;

  if(distance < DISTANCE_THRESHOLD){
    digitalWrite(BUZZER_PIN, HIGH); 
    Serial.write("Buzzing!!");
  }
  else
    digitalWrite(BUZZER_PIN, LOW);  

  ThingSpeak.writeField(myChannelField, ChannelField, distance, myWriteAPIKey);
  Serial.print("distance: ");
  Serial.print(distance);
  Serial.println(" cm");
}
