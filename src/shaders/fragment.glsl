#define PI 3.1415926535897932384626433832795

precision highp float;

uniform uint uCopies;
uniform uint uMilliseconds;
uniform uint uSeconds;
uniform uint uMinutes;
uniform uint uHours;
uniform float uCameraAngleCoef;

varying vec2 vUv;
varying vec3 vPosition;

float sdCircle(vec2 p, float r) {
  return length(p) - r;
}

float sdSegment(in vec2 p, in vec2 a, in vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);

    return length(pa - ba * h);
}

float opOnion(in float d, in float r) {
  return abs(d) - r;
}

vec4 stroke(in float sd, in vec4 color, in vec4 strokeColor, in float sh, in float th) {
  float shapeColor = 1.0 - smoothstep(th - sh, th, abs(sd));

  if (color.r == -1.0) {
    return vec4(strokeColor.rgb, shapeColor);
  } else {
    return mix(color, strokeColor, vec4(shapeColor));
  }
}

vec4 fill(in float sd, in vec4 color, in vec4 fillColor, in float sh) {
  float shapeColor = 1.0 - smoothstep(0.0, sh, sd);

  if (color.r == -1.0) {
    return vec4(fillColor.rgb, shapeColor);
  } else {
    return mix(color, fillColor, vec4(shapeColor));
  }
}

float easeOutElastic(float x) {
    float c4 = (2.0 * PI) / 3.0;

    if (x == 0.0) {
        return 0.0;
    } else if (x == 1.0) {
        return 1.0;
    } else {
        return pow(2.0, -10.0 * x) * sin((x * 10.0 - 0.75) * c4) + 1.0;
    }
}

void main() {
  vec2 nUv = vUv.xy * 2.0 - 1.0; // normalized uv (-1.0 to 1.0 on both axis)
  vec4 color = vec4(vec3(-1.0), 0.0);
  vec4 strokeColor = vec4(1.0);
  vec4 secondsStrokeColor = vec4(1.0, 0.0, 0.0, 1.0);
  float sh = 0.005/1.5; // sharpness
  float th = 0.05; // thickness
  float timeOffset = 1.0 - (vPosition.z / float(uCopies));
  float mixAmount = 1.0 - pow(vPosition.z / float(uCopies), 3.0);

  float onionTh = th;

  if (vPosition.z < float(uCopies)) {
    float mixAmountCamera = 1.0 - ((1.0 - mixAmount) * pow(uCameraAngleCoef, 0.75));

    strokeColor = mix(strokeColor, vec4(0.0), vec4(vec3(mixAmountCamera), 0.0));
    secondsStrokeColor = mix(secondsStrokeColor, vec4(0.0), vec4(vec3(mixAmountCamera), 0.0));
  }

  sh = mix(sh, 0.06, mixAmount);
  th = mix(th, 0.2, mixAmount);

  if (vPosition.z >= float(uCopies)) {
    color = stroke(sdCircle(nUv, 1.0 - th), color, strokeColor, sh, th / 2.0);
  }

  for (int i = 0; i < 4; i++) {
    float angle = float(i) * (2.0 * PI) / 4.0;

    color = stroke(
      sdSegment(nUv,
        vec2(sin(angle), cos(angle)) * .85,
        vec2(sin(angle), cos(angle)) * .94
      ),
      color,
      strokeColor,
      sh,
      th / 2.0
    );
  }

  for (int i = 0; i < 12; i++) {
    float angle = float(i) * (2.0 * PI) / 12.0;

    color = stroke(
      sdSegment(nUv,
        vec2(sin(angle), cos(angle)) * .87,
        vec2(sin(angle), cos(angle)) * .94
      ),
      color,
      strokeColor,
      sh,
      th / 4.0
    );
  }

  for (int i = 0; i < 60; i++) {
    float angle = float(i) * (2.0 * PI) / 60.0;

    color = stroke(
      sdSegment(nUv,
        vec2(sin(angle), cos(angle)) * .90,
        vec2(sin(angle), cos(angle)) * .94
      ),
      color,
      strokeColor,
      sh,
      th / 9.0
    );
  }

  float hoursAngle = float(uHours) * (2.0 * PI) / 12.0 + float(uMinutes) * (2.0 * PI) / 12.0 / 60.0 - timeOffset;
  color = stroke(
    opOnion(sdSegment(nUv, vec2(0.0, 0.0), vec2(sin(hoursAngle), cos(hoursAngle)) * .5), onionTh / 3.0),
    color,
    strokeColor,
    sh,
    th / 5.0
  );

  float minutesAngle = float(uMinutes) * (2.0 * PI) / 60.0 + float(uSeconds) * (2.0 * PI) / 60.0 / 60.0 - timeOffset;
  color = stroke(sdSegment(nUv, vec2(0.0, 0.0), vec2(sin(minutesAngle), cos(minutesAngle)) * .65), color, strokeColor, sh, th / 5.0);

  color = fill(sdCircle(nUv, 0.025 + th / 5.0), color, strokeColor, sh);
  color = fill(sdCircle(nUv, 0.025), color, secondsStrokeColor, sh);

  float secondsAngle = float(uSeconds) * (2.0 * PI) / 60.0 + easeOutElastic(float(uMilliseconds) / 1000.0) * PI * (1.0 / 30.0) - timeOffset;
  color = stroke(
    sdSegment(nUv,
      vec2(sin(secondsAngle - PI), cos(secondsAngle - PI)) * .1,
      vec2(sin(secondsAngle), cos(secondsAngle)) * .80
    ),
    color,
    secondsStrokeColor,
    sh,
    th / 7.0
  );

  if (color.r == -1.0) {
    discard;
  }

  gl_FragColor = color;
}
