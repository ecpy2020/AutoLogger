#  AutoLogger framework
------------------------
welcome to fork

## pendings
- 2022: will rebuild using pre-script-syntax-tree-parser on python and also nodejs 

## purpose
- automatically log the function calls including all types of payloads, errors with execution time, performance monitoring, enable absolutely bug free application development to save engineers' debugging time cost

## running sample
- to run sample, please execute `node ./sample/index.js`

## example logs
```
{
  eventType: [ 'MODULE_REQUIRED', 'MODULE_PROCESSED' ],
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/C.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.9210219992770567 }
}
{
  eventType: [ 'MODULE_REQUIRED', 'MODULE_PROCESSED' ],
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/A.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.5954287904770528 }
}
{
  eventType: 'CLASS_CONSTRUCTOR_FUNCTION_CALL_START',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  className: 'C',
  classInstanceId: 'classInstanceId@2744141839997432',
  functionName: 'constructor',
  functionArguments: '[]',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/C.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.4779510124550552 }
}
{
  eventType: 'CLASS_CONSTRUCTOR_FUNCTION_CALL_RETURN',
  className: 'C',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  classInstanceId: 'classInstanceId@2744141839997432',
  functionName: 'constructor',
  functionReturn: '{}',
  functionExecutionTime: '0.001 seconds',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/C.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.9517588336071965 }
}
{
  eventType: 'CLASS_INSTANCE_FUNCTION_CALL_START',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  functionArguments: '[\n  "args: c"\n]',
  functionKey: 'c_method',
  functionName: 'c_method',
  functionCallId: 'functionCallId@5657642480173583',
  functionStartTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/C.js',
  className: 'C',
  classInstanceId: 'classInstanceId@2744141839997432',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.2772222857794333 }
}
{
  eventType: 'CLASS_INSTANCE_FUNCTION_CALL_SYNC_RETURN',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  functionName: 'c_method',
  functionKey: 'c_method',
  functionCallId: 'functionCallId@5657642480173583',
  functionExecutionTime: '0 seconds',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/C.js',
  className: 'C',
  classInstanceId: 'classInstanceId@2744141839997432',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.7373958057456047 }
}
{
  eventType: 'RAW_FUNCTION_CALL_START',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  functionArguments: '[\n  "_isArray"\n]',
  functionKey: '_isArray',
  functionName: 'isArray',
  functionCallId: 'functionCallId@5256704356155483',
  functionStartTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/A.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.21660901551117195 }
}
{
  eventType: 'RAW_FUNCTION_CALL_SYNC_RETURN',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  functionName: 'isArray',
  functionKey: '_isArray',
  functionCallId: 'functionCallId@5256704356155483',
  functionExecutionTime: '0 seconds',
  functionReturn: 'false',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/A.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.14714736107109805 }
}
{
  eventType: 'RAW_FUNCTION_CALL_START',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  functionArguments: '[\n  "HA HA"\n]',
  functionKey: 'HAHA',
  functionName: 'HIHI',
  functionCallId: 'functionCallId@7565326950010229',
  functionStartTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/A.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.738971389602394 }
}
{
  eventType: 'RAW_FUNCTION_CALL_SYNC_RETURN',
  eventTime: 'Fri Oct 08 2021 13:34:11 GMT+0800 (Hong Kong Standard Time)',
  functionName: 'HIHI',
  functionKey: 'HAHA',
  functionCallId: 'functionCallId@7565326950010229',
  functionExecutionTime: '0 seconds',
  modulePath: '/home/edward/Desktop/ROOT/PROJECTS/AutoLogger/sample/A.js',
  tags: { framework: 'AUTO_LOGGER_2020', some: 0.40335691600118784 }
}
```
