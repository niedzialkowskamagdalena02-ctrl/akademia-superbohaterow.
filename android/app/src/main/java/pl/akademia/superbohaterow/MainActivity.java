package pl.akademia.superbohaterow;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.net.http.SslError;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.SslErrorHandler;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebMessage;
import android.webkit.WebMessagePort;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.Button;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Locale;
import java.util.Set;

public final class MainActivity extends Activity {
 private static final String ORIGIN="https://niedzialkowskamagdalena02-ctrl.github.io";
 private static final String ROOT="/akademia-superbohaterow./";
 private static final String HOME=ORIGIN+ROOT;
 private final Handler main=new Handler(Looper.getMainLooper());
 private WebView web;
 private WebMessagePort channel;
 private TextToSpeech tts;
 private boolean ttsReady=false,visible=false,stopping=false,continuous=false;
 private SpeechRecognizer recognizer;
 private String recognitionId="";
 private int documentEpoch=0,recognitionEpoch=0;
 private JSONObject pendingListen;
 private ValueCallback<Uri[]> fileCallback;
 private LinearLayout layout;
 private TextView status;

 @Override public void onCreate(Bundle saved){
  super.onCreate(saved);
  getWindow().setStatusBarColor(Color.rgb(22,64,94));
  getWindow().setNavigationBarColor(Color.rgb(22,64,94));
  layout=new LinearLayout(this);layout.setOrientation(LinearLayout.VERTICAL);
  layout.setOnApplyWindowInsetsListener((view,insets)->{view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets.consumeSystemWindowInsets();});
  status=new TextView(this);status.setText("Akademia • łączenie…");status.setTextColor(Color.rgb(25,62,87));status.setPadding(18,10,18,10);layout.addView(status);
  web=new WebView(this);layout.addView(web,new LinearLayout.LayoutParams(-1,0,1));setContentView(layout);
  WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);
  s.setAllowFileAccess(false);s.setAllowContentAccess(true);s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  s.setSupportMultipleWindows(false);s.setJavaScriptCanOpenWindowsAutomatically(false);s.setMediaPlaybackRequiresUserGesture(true);
  s.setUserAgentString(s.getUserAgentString()+" AkademiaAndroid/79");
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v,WebResourceRequest r){return !trusted(r.getUrl());}
   @Override public void onPageStarted(WebView v,String url,android.graphics.Bitmap icon){
    documentEpoch++;closeChannel();cancelRecognition(true);if(tts!=null)tts.stop();status.setText("Akademia • wczytywanie…");status.setVisibility(android.view.View.VISIBLE);
   }
   @Override public void onPageFinished(WebView v,String url){
    if(channel!=null||!trusted(Uri.parse(url)))return;
    final int epoch=documentEpoch;
    try{
     java.io.InputStream input=getAssets().open("android79.js");ByteArrayOutputStream bytes=new ByteArrayOutputStream();byte[] b=new byte[4096];int n;while((n=input.read(b))!=-1)bytes.write(b,0,n);input.close();
     web.evaluateJavascript(bytes.toString("UTF-8"),value->{
      if(epoch!=documentEpoch||!trusted(Uri.parse(web.getUrl())))return;
      closeChannel();WebMessagePort[] ports=web.createWebMessageChannel();channel=ports[0];
      channel.setWebMessageCallback(new WebMessagePort.WebMessageCallback(){@Override public void onMessage(WebMessagePort p,WebMessage message){if(p==channel&&epoch==documentEpoch)handle(message.getData());}},main);
      web.postWebMessage(new WebMessage("academy-native-79",new WebMessagePort[]{ports[1]}),Uri.parse(ORIGIN));
     });
    }catch(Exception ex){showStatus("Nie udało się uruchomić obsługi głosu. Zamknij i otwórz Akademię.");}
   }
   @Override public void onReceivedError(WebView v,WebResourceRequest r,WebResourceError e){if(r.isForMainFrame())showConnectionError();}
   @Override public void onReceivedSslError(WebView v,SslErrorHandler h,SslError e){h.cancel();showStatus("Nie można bezpiecznie połączyć się z Akademią. Sprawdź datę i internet w telefonie.");}
  });
  web.setWebChromeClient(new WebChromeClient(){
   @Override public boolean onShowFileChooser(WebView v,ValueCallback<Uri[]> cb,FileChooserParams p){
    if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=cb;
    try{Intent i=p.createIntent();i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,21);}catch(Exception ex){fileCallback=null;cb.onReceiveValue(null);showStatus("Nie udało się otworzyć wyboru zdjęć.");}return true;
   }
  });
  tts=new TextToSpeech(this,result->{ttsReady=result==TextToSpeech.SUCCESS;if(ttsReady)sendVoices();});
  tts.setOnUtteranceProgressListener(new UtteranceProgressListener(){
   @Override public void onStart(String id){emitSpeech(id,"start","");}
   @Override public void onDone(String id){emitSpeech(id,"end","");}
   @Override public void onError(String id){emitSpeech(id,"error","synthesis-failed");}
   @Override public void onError(String id,int code){onError(id);}
  });
  if(saved==null||web.restoreState(saved)==null)web.loadUrl(HOME);
 }
 static boolean trusted(Uri uri){return uri!=null&&"https".equals(uri.getScheme())&&"niedzialkowskamagdalena02-ctrl.github.io".equals(uri.getHost())&&(uri.getPort()==-1||uri.getPort()==443)&&uri.getPath()!=null&&uri.getPath().startsWith(ROOT);}
 private void handle(String raw){
  if(raw==null||raw.length()>32000||!trusted(Uri.parse(web.getUrl()))||!visible)return;
  try{JSONObject m=new JSONObject(raw);String action=m.optString("action");
   switch(action){
    case "ready":status.setVisibility(android.view.View.GONE);sendVoices();break;
    case "speak":speak(m);break;
    case "cancel-speech":if(tts!=null)tts.stop();break;
    case "listen":beginListen(m);break;
    case "stop-listening":if(m.optString("id").equals(recognitionId)){stopping=true;if(recognizer!=null)recognizer.stopListening();else cancelRecognition(true);}break;
    case "cancel-listening":if(m.optString("id").equals(recognitionId))cancelRecognition(true);break;
    default:break;
   }
  }catch(Exception ignored){}
 }
 private void send(JSONObject m){final WebMessagePort target=channel;main.post(()->{if(target!=null&&target==channel)try{target.postMessage(new WebMessage(m.toString()));}catch(Exception ignored){}});}
 private JSONObject message(String type,String id,String event){JSONObject m=new JSONObject();try{m.put("type",type);m.put("id",id);m.put("event",event);}catch(Exception ignored){}return m;}
 private void emitSpeech(String nativeId,String event,String error){main.post(()->{String prefix=documentEpoch+":";if(!nativeId.startsWith(prefix))return;String id=nativeId.substring(prefix.length());JSONObject m=message("speech",id,event);try{m.put("error",error);}catch(Exception ignored){}send(m);});}
 private void emitRecognition(String id,String event,String error){JSONObject m=message("recognition",id,event);try{m.put("error",error);}catch(Exception ignored){}send(m);}
 private Locale language(String tag){return Locale.forLanguageTag(tag!=null&&tag.toLowerCase(Locale.ROOT).startsWith("en")?"en-GB":"pl-PL");}
 private void sendVoices(){
  if(!ttsReady||tts==null)return;JSONObject m=new JSONObject();JSONArray list=new JSONArray();
  try{for(String tag:new String[]{"pl-PL","en-GB"})if(tts.isLanguageAvailable(Locale.forLanguageTag(tag))>=0){JSONObject v=new JSONObject();v.put("lang",tag);v.put("name","Android "+tag);list.put(v);}m.put("type","voices");m.put("voices",list);send(m);}catch(Exception ignored){}
 }
 private void speak(JSONObject m){
  final String id=documentEpoch+":"+m.optString("id"),text=m.optString("text");
  if(!ttsReady||tts==null){emitSpeech(id,"error","synthesis-unavailable");showStatus("Głos telefonu nie jest gotowy. Spróbuj ponownie za chwilę.");return;}
  Locale lang=language(m.optString("lang"));
  if(tts.setLanguage(lang)<0){emitSpeech(id,"error","language-unavailable");showStatus("Brakuje głosu "+(lang.getLanguage().equals("en")?"angielskiego":"polskiego")+". W ustawieniach telefonu pobierz ten język w funkcji zamiany tekstu na mowę.");return;}
  tts.setSpeechRate((float)Math.max(.5,Math.min(1.2,m.optDouble("rate",.85))));tts.setPitch((float)Math.max(.8,Math.min(1.2,m.optDouble("pitch",1))));
  if(text.length()>5000||tts.speak(text,TextToSpeech.QUEUE_ADD,null,id)==TextToSpeech.ERROR)emitSpeech(id,"error","synthesis-failed");
 }
 private void beginListen(JSONObject m){
  cancelRecognition(true);recognitionId=m.optString("id");pendingListen=m;
  if(checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED){requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},11);return;}
  startRecognizer(m,++recognitionEpoch);
 }
 private void startRecognizer(final JSONObject m,final int epoch){
  pendingListen=null;final String id=m.optString("id");
  if(!visible||!id.equals(recognitionId))return;
  if(!SpeechRecognizer.isRecognitionAvailable(this)){emitRecognition(id,"error","service-not-allowed");showStatus("W telefonie brakuje usługi rozpoznawania mowy. Sprawdź usługę głosową Google i jej uprawnienia.");finishRecognition(id);return;}
  continuous=m.optBoolean("continuous");stopping=false;
  recognizer=SpeechRecognizer.createSpeechRecognizer(this);final SpeechRecognizer current=recognizer;
  current.setRecognitionListener(new RecognitionListener(){
   private boolean active(){return visible&&epoch==recognitionEpoch&&current==recognizer&&id.equals(recognitionId);}
   @Override public void onReadyForSpeech(Bundle params){if(active())emitRecognition(id,"start","");}
   @Override public void onBeginningOfSpeech(){}
   @Override public void onRmsChanged(float rms){}
   @Override public void onBufferReceived(byte[] buffer){}
   @Override public void onEndOfSpeech(){}
   @Override public void onPartialResults(Bundle results){if(active()&&m.optBoolean("interim"))result(results,false);}
   private void result(Bundle results,boolean done){JSONObject out=message("recognition",id,"result");ArrayList<String> words=results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);try{out.put("alternatives",words==null?new JSONArray():new JSONArray(words));out.put("final",done);send(out);}catch(Exception ignored){}}
   @Override public void onResults(Bundle results){
    if(!active())return;result(results,true);
    if(continuous&&!stopping){current.destroy();recognizer=null;main.postDelayed(()->{if(visible&&epoch==recognitionEpoch&&id.equals(recognitionId))startRecognizer(m,epoch);},250);}else finishRecognition(id);
   }
   @Override public void onError(int code){if(!active())return;String error=code==SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS?"not-allowed":code==SpeechRecognizer.ERROR_NO_MATCH||code==SpeechRecognizer.ERROR_SPEECH_TIMEOUT?"no-speech":"network";emitRecognition(id,"error",error);finishRecognition(id);}
   @Override public void onEvent(int type,Bundle params){}
  });
  Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,language(m.optString("lang")).toLanguageTag());intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS,5);intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS,m.optBoolean("interim"));
  try{current.startListening(intent);}catch(Exception ex){emitRecognition(id,"error","service-not-allowed");finishRecognition(id);}
 }
 private void finishRecognition(String id){if(!id.equals(recognitionId))return;recognitionEpoch++;recognitionId="";pendingListen=null;if(recognizer!=null){recognizer.destroy();recognizer=null;}emitRecognition(id,"end","");}
 private void cancelRecognition(boolean notify){String id=recognitionId;recognitionEpoch++;recognitionId="";pendingListen=null;if(recognizer!=null){recognizer.cancel();recognizer.destroy();recognizer=null;}if(notify&&!id.isEmpty()){emitRecognition(id,"error","aborted");emitRecognition(id,"end","");}}
 private void closeChannel(){if(channel!=null){try{channel.close();}catch(Exception ignored){}channel=null;}}
 private void showStatus(String text){main.post(()->{status.setText(text);status.setVisibility(android.view.View.VISIBLE);});}
 private void showConnectionError(){showStatus("Brak połączenia z Akademią. Sprawdź internet.");new AlertDialog.Builder(this).setTitle("Akademia").setMessage("Nie udało się otworzyć aplikacji. Twoje zapisane dane pozostają w telefonie.").setPositiveButton("Spróbuj ponownie",(d,w)->web.loadUrl(HOME)).setNegativeButton("Zamknij",(d,w)->finish()).show();}
 @Override public void onRequestPermissionsResult(int r,String[] permissions,int[] results){super.onRequestPermissionsResult(r,permissions,results);if(r==11&&pendingListen!=null){JSONObject m=pendingListen;if(results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED)startRecognizer(m,++recognitionEpoch);else{emitRecognition(recognitionId,"error","not-allowed");finishRecognition(recognitionId);}}}
 @Override protected void onActivityResult(int r,int result,Intent intent){super.onActivityResult(r,result,intent);if(r==21&&fileCallback!=null){fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(result,intent));fileCallback=null;}}
 @Override protected void onResume(){super.onResume();visible=true;if(web!=null)web.onResume();}
 @Override protected void onPause(){visible=false;cancelRecognition(true);if(tts!=null)tts.stop();if(web!=null){web.evaluateJavascript("window.speechSynthesis&&window.speechSynthesis.cancel();document.dispatchEvent(new CustomEvent('academy:voice-stop'));",null);web.onPause();}super.onPause();}
 @Override public void onBackPressed(){if(web.canGoBack())web.goBack();else new AlertDialog.Builder(this).setMessage("Zamknąć Akademię?").setPositiveButton("Zamknij",(d,w)->finish()).setNegativeButton("Zostań",null).show();}
 @Override protected void onSaveInstanceState(Bundle out){super.onSaveInstanceState(out);web.saveState(out);}
 @Override protected void onDestroy(){visible=false;documentEpoch++;cancelRecognition(false);closeChannel();if(tts!=null){tts.stop();tts.shutdown();}if(fileCallback!=null)fileCallback.onReceiveValue(null);if(web!=null)web.destroy();super.onDestroy();}
}
