'use client';

import { Tooltip, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Link, Text } = Typography;

export interface InfoTooltipProps {
  title: string;
  content: string | React.ReactNode;
  links?: Array<{
    text: string;
    url: string;
  }>;
  size?: 'small' | 'default';
}

export default function InfoTooltip({ title, content, links, size = 'default' }: InfoTooltipProps) {
  const tooltipContent = (
    <div style={{ maxWidth: 300 }}>
      <div style={{ marginBottom: 8 }}>
        <Text strong style={{ color: '#fff' }}>{title}</Text>
      </div>
      <div style={{ marginBottom: links && links.length > 0 ? 8 : 0 }}>
        {typeof content === 'string' ? (
          <Text style={{ fontSize: 12, color: '#ddd' }}>{content}</Text>
        ) : (
          content
        )}
      </div>
      {links && links.length > 0 && (
        <div style={{ borderTop: '1px solid #444', paddingTop: 8, marginTop: 8 }}>
          <Text style={{ fontSize: 11, color: '#aaa', display: 'block', marginBottom: 4 }}>
            References:
          </Text>
          {links.map((link, index) => (
            <div key={index} style={{ marginBottom: 2 }}>
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11 }}
              >
                {link.text}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent} placement="top">
      <InfoCircleOutlined
        style={{
          marginLeft: size === 'small' ? 4 : 6,
          fontSize: size === 'small' ? 12 : 14,
          color: '#4A9EFF',
          cursor: 'help',
          verticalAlign: 'middle'
        }}
      />
    </Tooltip>
  );
}
