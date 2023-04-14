#define PI 3.1415926535897932384626433832795

precision highp float;

uniform float uCount;
uniform uint uMilliseconds;
uniform uint uSeconds;
uniform uint uMinutes;
uniform uint uHours;
uniform float uMinAzimuthAngle;
uniform float uMaxAzimuthAngle;
uniform float uMinPolarAngle;
uniform float uMaxPolarAngle;
uniform float uAzimuthalAngle;
uniform float uPolarAngle;

varying vec2 vUv;

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

  return mix(color, strokeColor, vec4(shapeColor));
}

vec4 fill(in float sd, in vec4 color, in vec4 fillColor, in float sh) {
  float shapeColor = 1.0 - smoothstep(0.0, sh, sd);

  return mix(color, fillColor, vec4(shapeColor));
}

vec4 fillInverted(in float sd, in vec4 color, in vec4 fillColor) {
  return mix(color, fillColor, vec4(sd > 0.0 ? 1.0 : 0.0));
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

vec4 clock(vec2 uv, vec4 color, float i, float cameraAngleCoef) {
  vec4 strokeColor = vec4(1.0);
  vec4 secondsStrokeColor = vec4(1.0, 0.0, 0.0, 1.0);
  float sh = 0.005/1.5; // sharpness
  float th = 0.05; // thickness
  float mixAmount = 1.0 - pow(i / uCount, 2.0);

  float origTh = th;

  if (i < uCount) {
    float mixAmountCamera = 1.0 - ((1.0 - mixAmount) * pow(cameraAngleCoef, 0.75));

    strokeColor = mix(strokeColor, vec4(0.0), vec4(vec3(mixAmountCamera), 0.0));
    secondsStrokeColor = mix(secondsStrokeColor, vec4(0.0), vec4(vec3(mixAmountCamera), 0.0));
  }

  sh = mix(sh, 0.06, mixAmount);
  th = mix(th, 0.2, mixAmount);

  if (i >= uCount) {
   color = fillInverted(sdCircle(uv, 1.0 - th), color, vec4(vec3(0.0), 1.0));
   color = stroke(sdCircle(uv, 1.0 - th), color, strokeColor, sh, th / 2.0);
  }

  for (int i = 0; i < 4; i++) {
    float angle = float(i) * (2.0 * PI) / 4.0;

    color = stroke(
      sdSegment(uv,
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
      sdSegment(uv,
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
      sdSegment(uv,
        vec2(sin(angle), cos(angle)) * .90,
        vec2(sin(angle), cos(angle)) * .94
      ),
      color,
      strokeColor,
      sh,
      th / 9.0
    );
  }

  float hoursAngle = float(uHours) * (2.0 * PI) / 12.0 + float(uMinutes) * (2.0 * PI) / 12.0 / 60.0;
  color = stroke(
    opOnion(sdSegment(uv, vec2(0.0, 0.0), vec2(sin(hoursAngle), cos(hoursAngle)) * .5), origTh / 3.0),
    color,
    strokeColor,
    sh,
    th / 5.0
  );

  float minutesAngle = float(uMinutes) * (2.0 * PI) / 60.0 + float(uSeconds) * (2.0 * PI) / 60.0 / 60.0;
  color = stroke(sdSegment(uv, vec2(0.0, 0.0), vec2(sin(minutesAngle), cos(minutesAngle)) * .65), color, strokeColor, sh, th / 5.0);

  color = fill(sdCircle(uv, 0.025 + th / 5.0 - mix(0.0, 0.06, mixAmount)), color, strokeColor, sh);
  color = fill(sdCircle(uv, 0.025 - mix(0.0, 0.04, mixAmount)), color, secondsStrokeColor, sh);

  float secondsAngle = float(uSeconds) * (2.0 * PI) / 60.0 + easeOutElastic(float(uMilliseconds) / 1000.0) * PI * (1.0 / 30.0);
  color = stroke(
    sdSegment(uv,
      vec2(sin(secondsAngle - PI), cos(secondsAngle - PI)) * .1,
      vec2(sin(secondsAngle), cos(secondsAngle)) * .80
    ),
    color,
    secondsStrokeColor,
    sh,
    th / 7.0
  );

  return color;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0; // normalized uv (-1.0 to 1.0 on both axis)
  vec4 color = vec4(vec3(0.0), 1.0);

  // following calculations are probably totally wrong but they work well enough (it's for an effect anyway)
  float normalizedAA = ((uAzimuthalAngle - uMinAzimuthAngle) / (uMaxAzimuthAngle - uMinAzimuthAngle) - 0.5) * 2.0;
  float normalizedPA = ((uPolarAngle - uMinPolarAngle) / (uMaxPolarAngle - uMinPolarAngle) - 0.5) * 2.0;
  float cameraAngleCoef = max(abs(normalizedAA), abs(normalizedPA));

  for (float i = uCount - 1.0; i >= 0.0; i--) {
    float z = i * 0.1;
    float scaleCoef = z * ((abs(cameraAngleCoef) + 1.0) / 2.0) + 1.0;
    vec2 uvScaled = uv * (z + 1.0) * scaleCoef;
    vec2 uvTranslated = uvScaled + vec2(-normalizedAA, normalizedPA) * i * 0.33;

    color = clock(uvTranslated, color, uCount - i, cameraAngleCoef);
  }

  gl_FragColor = color;
}
